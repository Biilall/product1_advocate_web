import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { year: "2016", won: 12, total: 15 },
  { year: "2017", won: 18, total: 22 },
  { year: "2018", won: 25, total: 30 },
  { year: "2019", won: 32, total: 38 },
  { year: "2020", won: 28, total: 33 },
  { year: "2021", won: 35, total: 40 },
  { year: "2022", won: 42, total: 48 },
  { year: "2023", won: 50, total: 55 },
  { year: "2024", won: 48, total: 52 },
];

const SuccessSection = () => {
  const totalWon = data.reduce((s, d) => s + d.won, 0);
  const totalCases = data.reduce((s, d) => s + d.total, 0);
  const ratio = Math.round((totalWon / totalCases) * 100);

  return (
    <section id="success" className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Track Record
      </p>

      <div className="text-center my-16">
        <span className="text-5xl sm:text-7xl md:text-9xl font-serif">{ratio}%</span>
        <p className="font-sans text-lg text-muted-foreground mt-4">
          Favorable Outcomes Since 2016
        </p>
      </div>

      <div className="h-72 mt-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "hsl(0 0% 40%)", fontSize: 12, fontFamily: "Source Sans 3" }}
              axisLine={{ stroke: "hsl(0 0% 92%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(0 0% 40%)", fontSize: 12, fontFamily: "Source Sans 3" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 100%)",
                border: "1px solid hsl(0 0% 92%)",
                borderRadius: "2px",
                fontFamily: "Source Sans 3",
                fontSize: 13,
              }}
            />
            <Bar dataKey="total" fill="hsl(0 0% 92%)" radius={[2, 2, 0, 0]} name="Total Cases" />
            <Bar dataKey="won" fill="hsl(0 0% 7%)" radius={[2, 2, 0, 0]} name="Won" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SuccessSection;
