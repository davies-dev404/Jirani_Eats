import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ImpactCharts({ requests = [] }) {
  // Process requests to get real monthly data
  const processData = () => {
      const last5Months = Array.from({ length: 5 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (4 - i));
          return d.toLocaleString('default', { month: 'short' });
      });

      // Initialize data structure
      const chartData = last5Months.map(month => ({
          name: month,
          meals: 0,
          co2: 0
      }));

      requests.forEach(req => {
          if (req.status === 'completed' || req.status === 'approved') {
               const reqDate = new Date(req.createdAt);
               const month = reqDate.toLocaleString('default', { month: 'short' });
               const found = chartData.find(d => d.name === month);
               if (found) {
                   found.meals += 1; // Assuming 1 request = 1 meal set for simplicity
                   found.co2 += 2.5; // Avg 2.5kg CO2 saved per meal
               }
          }
      });

      return chartData;
  };

  const data = processData();
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Your Environmental Impact</CardTitle>
        <CardDescription>
          Meals shared and CO2 saved (kg) over the last 5 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="meals" name="Meals Shared" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="co2" name="CO2 Saved (kg)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
