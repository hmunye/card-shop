import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CircleEqualIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function TransactionChart({
  chartData,
}: {
  chartData: { month: string; moneyMade: number; moneySpent: number }[];
}) {
  const totalMoneyMade = chartData.reduce(
    (sum, data) => sum + data.moneyMade,
    0,
  );

  const totalMoneySpent = chartData.reduce(
    (sum, data) => sum + data.moneySpent,
    0,
  );

  let profit = totalMoneyMade - totalMoneySpent;
  let percentageChange = 0;

  let icon = <CircleEqualIcon className="h-7 w-7" />;
  let trendText = "Broke even this month";

  if (totalMoneySpent === 0) {
    if (totalMoneyMade > 0) {
      percentageChange = 100;
      icon = <TrendingUp className="h-7 w-7" />;
      trendText = "Huge increase this month!";
    } else {
      percentageChange = 0;
      icon = <CircleEqualIcon className="h-7 w-7" />;
      trendText = "Broke even this month";
    }
  } else {
    percentageChange = (profit / totalMoneySpent) * 100;
    if (percentageChange > 0) {
      icon = <TrendingUp className="h-7 w-7" />;
      trendText = `Trending up by ${percentageChange.toFixed(2)}% this month`;
    } else if (percentageChange < 0) {
      icon = <TrendingDown className="h-7 w-7" />;
      trendText = `Trending down by ${Math.abs(percentageChange).toFixed(2)}% this month`;
    }
  }

  const chartConfig = {
    moneyMade: {
      label: "Money Made",
      color: "hsl(var(--chart-2))",
    },
    moneySpent: {
      label: "Money Spent",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <Card className="w-full sm:w-1/2">
      <CardHeader>
        <CardTitle>Monthly Breakdown and Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between text-xl font-medium mb-4">
            <div>
              <span className="text-muted-foreground">Total Money Made: </span>
              <span className="font-bold">
                ${totalMoneyMade.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Money Spent: </span>
              <span className="font-bold">
                ${totalMoneySpent.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-medium mb-4">
            <div>
              <span className="text-muted-foreground">Profit/Loss: </span>
              <span
                className={`font-bold ${
                  profit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${profit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <div>
                <span className="text-muted-foreground">
                  Profit Percentage:{" "}
                </span>
                <span
                  className={`font-bold ${
                    percentageChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {percentageChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 font-medium leading-none text-lg mb-4 mt-16">
            <div className="flex items-center gap-3">
              {trendText} {icon}
            </div>
          </div>
        </div>

        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="moneyMade"
              fill={chartConfig.moneyMade.color}
              radius={4}
            />
            <Bar
              dataKey="moneySpent"
              fill={chartConfig.moneySpent.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-4 text-lg">
        <div className="leading-none text-muted-foreground">
          Showing total transactions for the last few months. A visual breakdown
          of your spending and earnings.
        </div>
        <span className="text-muted-foreground block">
          Note: Profit percentage is calculated based on your earnings relative
          to your spending. A value greater than 100% means your earnings more
          than cover your spending.
        </span>
      </CardFooter>
    </Card>
  );
}
