// Local presentation fixtures only. These are illustrative prices, not live offers.
const part = (category, name, price, detail) => ({
  id: `${category}-${name}`.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
  category,
  name,
  price,
  detail,
});
const shared = [
  part(
    "Motherboard",
    "B650M motherboard",
    12000,
    "AM5 socket · DDR5 · micro-ATX",
  ),
  part("PSU", "650W Bronze power supply", 5000, "80 Plus Bronze · ATX"),
  part(
    "Cabinet",
    "Airflow mid-tower case",
    4000,
    "Mesh front · micro-ATX support",
  ),
  part("Cooler", "120 mm tower cooler", 2500, "AM5 mounting kit"),
];
const cpu = [
  part("CPU", "AMD Ryzen 5 7600", 19000, "6 cores / 12 threads · AM5"),
  part("CPU", "AMD Ryzen 7 7700", 29000, "8 cores / 16 threads · AM5"),
];
const gpu = [
  part("GPU", "GeForce RTX 4060", 30000, "8 GB GDDR6 · 1080p gaming"),
  part("GPU", "GeForce RTX 4070", 55000, "12 GB GDDR6X · 1440p gaming"),
];
const ram = [
  part("RAM", "16 GB DDR5 memory kit", 5000, "2 × 8 GB · 5600 MT/s"),
  part("RAM", "32 GB DDR5 memory kit", 9000, "2 × 16 GB · 5600 MT/s"),
];
const ssd = [
  part("SSD", "1 TB NVMe SSD", 5500, "PCIe 4.0 · M.2 storage"),
  part("SSD", "2 TB NVMe SSD", 10000, "PCIe 4.0 · M.2 storage"),
];
const accessories = {
  Monitor: [
    part("Monitor", "24-inch Full HD IPS monitor", 8000, "75 Hz · 1920 × 1080"),
    part("Monitor", "24-inch gaming monitor", 13000, "144 Hz · Full HD IPS"),
    part(
      "Monitor",
      "27-inch QHD IPS monitor",
      22000,
      "2560 × 1440 · More workspace",
    ),
  ],
  Keyboard: [
    part("Keyboard", "Compact wired keyboard", 1000, "Quiet keys · USB"),
    part(
      "Keyboard",
      "Mechanical TKL keyboard",
      4500,
      "Hot-swappable · Linear switches",
    ),
  ],
  Mouse: [
    part("Mouse", "Ergonomic wired mouse", 600, "Optical sensor · USB"),
    part(
      "Mouse",
      "Lightweight wireless mouse",
      3000,
      "Adjustable DPI · Rechargeable",
    ),
  ],
};
const sum = (products) =>
  products.reduce((total, product) => total + product.price, 0);
export function createDemoRecommendation(kind, request) {
  let products = [];
  const purposes = request.purposes || [request.purpose];
  const graphics = purposes.some((p) =>
    ["Gaming", "Streaming", "Video Editing"].includes(p),
  );
  const productivity = purposes.some((p) =>
    ["Programming", "Video Editing", "Photo Editing"].includes(p),
  );
  if (kind === "pc" && request.buildType === "COMPLETE_PC") {
    // Select among fixture layouts to demonstrate different budgets and purposes.
    const candidates = [];
    for (let c = 0; c < 2; c++)
      for (let r = 0; r < 2; r++)
        for (let s = 0; s < 2; s++)
          for (let g = 0; g < (graphics ? 2 : 1); g++) {
            const items = [
              cpu[c],
              ...(graphics ? [gpu[g]] : []),
              shared[0],
              ram[r],
              ssd[s],
              ...shared.slice(1),
            ];
            candidates.push({
              items,
              rank:
                c * (productivity ? 5 : 2) +
                r * (productivity ? 4 : 2) +
                s +
                (graphics ? g * 6 : 0),
            });
          }
    products =
      candidates
        .filter((item) => sum(item.items) <= request.budget)
        .sort((a, b) => b.rank - a.rank || sum(a.items) - sum(b.items))[0]
        ?.items || [];
  } else if (kind === "pc") {
    const options = [...cpu, ...gpu, ...ram, ...ssd, ...shared].filter(
      (p) => p.category === request.component && p.price <= request.budget,
    );
    const preferPremium = graphics || productivity;
    products = options
      .sort((a, b) => (preferPremium ? b.price - a.price : a.price - b.price))
      .slice(0, 1);
  } else {
    products = request.categories.map((category) => accessories[category][0]);
    if (sum(products) > request.budget) products = [];
    else {
      const priorities =
        request.purpose === "Gaming"
          ? ["Monitor", "Mouse", "Keyboard"]
          : ["Monitor", "Keyboard", "Mouse"];
      for (const category of priorities) {
        const index = products.findIndex((p) => p.category === category);
        if (index === -1) continue;
        const choices = accessories[category].filter(
          (p) =>
            p.price + sum(products) - products[index].price <= request.budget,
        );
        // A high-refresh display is the gaming fixture; QHD is the workspace fixture.
        products[index] =
          category === "Monitor" && request.purpose === "Gaming"
            ? choices.find((p) => p.price === 13000) || choices[0]
            : choices.at(-1);
      }
    }
  }
  products = products.map((product) => ({
    ...product,
    reason: `An illustrative ${product.category.toLowerCase()} choice for ${purposes.join(" + ")} within your shared budget.`,
  }));
  const total = sum(products);
  return {
    status: products.length ? "MATCH" : "NO_MATCH",
    currency: "INR",
    budget: request.budget,
    total,
    remainingBudget: request.budget - total,
    products,
    compatibility: kind === "peripherals" ? "NOT_APPLICABLE" : "UNKNOWN",
    warnings:
      products.length && kind === "pc"
        ? [
            "Sample parts only. Hardware compatibility has not been independently verified.",
          ]
        : [],
    message: products.length
      ? "A starting point for your setup."
      : kind === "peripherals"
        ? "No sample combination fits these preferences. Increase the budget or choose fewer accessories. The live catalog may offer more choices."
        : "No sample option fits these preferences. Try increasing your budget or choosing a different purpose. The live catalog may offer more choices.",
    dataSource: "SAMPLE_CATALOG",
  };
}
