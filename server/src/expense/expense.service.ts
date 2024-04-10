import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, GetExpenseDto, UpdateExpenseDto } from './dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getExpensePerDate(userId: number) {
    try {
      const userHouse = await this.prisma.userHouse.findFirst({
        where: { userId },
      });

      if (!userHouse) {
        throw new ForbiddenException(
          'You are not a member of the specified house.',
        );
      }

      const expensesPerMonth = [];

      // Iterate over the last three months, including the current month
      for (let i = 0; i <= 2; i++) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - i);
        const startYear = targetDate.getFullYear();
        const startMonth = targetDate.getMonth();

        const firstDayOfMonth = new Date(startYear, startMonth, 1);
        const lastDayOfMonth = new Date(startYear, startMonth + 1, 0);

        // Fetch expenses for the house within the month
        const expenses = await this.prisma.expense.findMany({
          where: {
            houseId: userHouse.houseId,
            date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
          orderBy: {
            date: 'desc',
          },
          include: {
            payments: {
              select: {
                id: true,
                fee: true,
                paidDate: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        });

        // Group expenses by date, then by buyer
        const groupedExpenses = expenses.reduce((acc, expense) => {
          const expenseDate = expense.date.toISOString().split('T')[0];

          if (!acc[expenseDate]) {
            acc[expenseDate] = {};
          }

          const buyerKey = expense.user.id;

          if (!acc[expenseDate][buyerKey]) {
            acc[expenseDate][buyerKey] = [];
          }

          acc[expenseDate][buyerKey].push(expense);

          return acc;
        }, {});

        // Transform grouped expenses into an array for each date
        const expensesByDateArray = Object.keys(groupedExpenses).map((date) => {
          const expenseDate = new Date(date + 'T00:00:00');

          const monthAbbreviation = expenseDate
            .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
            .toUpperCase();

          const day = expenseDate.getUTCDate();

          return {
            date: `${monthAbbreviation} ${day}`,
            buyers: Object.keys(groupedExpenses[date]).map((buyerId) => ({
              buyerId,
              expenses: groupedExpenses[date][buyerId],
            })),
          };
        });

        // Add the expenses for the month to the expensesPerMonth array
        expensesPerMonth.push({
          month: `${new Date(startYear, startMonth, 1).toLocaleString('en-US', { month: 'long' })} ${startYear}`,
          expenses: expensesByDateArray,
        });
      }

      return expensesPerMonth;
    } catch (error) {
      console.error('Error getting expenses per date:', error);
      throw error;
    }
  }

  // TODO: Need to change logic
  async getExpensePerMonth(userId: number, dto: GetExpenseDto) {
    try {
      const { year, month, houseId } = dto;

      const userHouse = await this.prisma.userHouse.findFirst({
        where: { userId, houseId },
      });

      if (!userHouse) {
        throw new ForbiddenException(
          'You are not a member of the specified house.',
        );
      }

      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);

      const expenses = await this.prisma.expense.findMany({
        where: {
          houseId: userHouse.houseId,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        orderBy: {
          date: 'desc',
        },
        include: {
          payments: {
            select: {
              id: true,
              fee: true,
              paidDate: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      });

      const groupedExpenses = expenses.reduce((acc, expense) => {
        const buyerKey = expense.user.id;
        if (!acc[buyerKey]) {
          acc[buyerKey] = {};
        }

        const expenseDate = expense.date.toISOString().split('T')[0];
        if (!acc[buyerKey][expenseDate]) {
          acc[buyerKey][expenseDate] = [];
        }

        acc[buyerKey][expenseDate].push(expense);
        return acc;
      }, {});

      return groupedExpenses;
    } catch (error) {
      console.error('Error getting expenses per month:', error);
      throw error;
    }
  }

  async getExpense(userId: number, expenseId: number) {
    try {
      const userHouse = await this.prisma.userHouse.findFirst({
        where: { userId },
      });

      if (!userHouse) {
        throw new ForbiddenException('You do not belong to any house.');
      }

      const expense = await this.prisma.expense.findUnique({
        where: {
          id: expenseId,
        },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${expenseId} not found.`);
      }

      if (expense.houseId !== userHouse.houseId) {
        throw new ForbiddenException(
          'You do not have permission to get this expense.',
        );
      }

      return expense;
    } catch (error) {
      console.error('Error getting expense:', error);
      throw error;
    }
  }

  async createExpense(userId: number, dto: CreateExpenseDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if the user belongs to the specified house
        const userHouse = await tx.userHouse.findFirst({
          where: {
            userId: userId,
            houseId: dto.houseId,
          },
        });

        // If the user does not belong to the house, throw an error
        if (!userHouse) {
          throw new ForbiddenException(
            'You are not a member of the specified house.',
          );
        }

        const createdExpense = await tx.expense.create({
          data: {
            itemName: dto.itemName,
            fee: dto.fee,
            date: dto.date,
            houseId: dto.houseId,
            buyerId: userId,
          },
        });

        const houseMembersList = await tx.userHouse.findMany({
          where: {
            houseId: dto.houseId,
          },
        });

        // Calculate the individual payment amount (rounded to two decimal place)
        const individualPaymentAmount =
          Math.floor((dto.fee / houseMembersList.length) * 100) / 100;

        // Payment data for each house member (excluding the buyer)
        const paymentsData = houseMembersList
          .filter((houseMember) => houseMember.userId !== userId)
          .map((houseMember) => ({
            fee: individualPaymentAmount,
            expenseId: createdExpense.id,
            payerId: houseMember.userId,
          }));

        await tx.payment.createMany({
          data: paymentsData,
        });

        // Get all payments linked to the created expense
        const createdPaymentsResult = await tx.payment.findMany({
          where: {
            expenseId: createdExpense.id,
          },
        });

        return {
          expense: { ...createdExpense, payments: createdPaymentsResult },
        };
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async updateExpense(
    userId: number,
    expenseId: number,
    dto: UpdateExpenseDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const expense = await tx.expense.findUnique({
          where: { id: expenseId },
        });

        if (!expense) {
          throw new NotFoundException(
            `Expense with ID ${expenseId} not found.`,
          );
        }

        if (expense.buyerId !== userId) {
          throw new ForbiddenException(
            'You do not have permission to update this expense.',
          );
        }

        const updatedExpense = await tx.expense.update({
          where: { id: expenseId },
          data: {
            itemName: dto.itemName,
            fee: dto.fee,
            date: dto.date,
          },
        });

        // Count the number of existing payments related to this expense.
        const existingPaymentsCount = await tx.payment.count({
          where: {
            expenseId: expenseId,
          },
        });

        // Calculate the amount each member has to pay, dividing the total fee by the number of members involved (including the buyer).
        const individualPaymentAmount =
          Math.floor((dto.fee / (existingPaymentsCount + 1)) * 100) / 100;

        // Update the fee for all payments associated with this expense
        await tx.payment.updateMany({
          where: {
            expenseId: updatedExpense.id,
          },
          data: {
            fee: individualPaymentAmount,
          },
        });

        const updatedPayments = await tx.payment.findMany({
          where: {
            expenseId: updatedExpense.id,
          },
        });

        return {
          expense: { ...updatedExpense, payments: updatedPayments },
        };
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(userId: number, expenseId: number) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        throw new NotFoundException(`Expense with ID ${expenseId} not found.`);
      }

      if (expense.buyerId !== userId) {
        throw new UnauthorizedException(
          'You do not have permission to delete this expense.',
        );
      }

      await this.prisma.expense.delete({
        where: {
          id: expenseId,
        },
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
}
