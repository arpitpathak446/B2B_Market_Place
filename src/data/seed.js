// Seed marketplace data. Lives entirely in localStorage; reset to defaults with
// the "Reset demo data" button in the chat panel.
//
// Every image in this list comes from find_stock_images and is treated as a
// real URL. Captions reflect what the photo actually shows.

export const CATEGORIES = [
  { id: 'machinery', image: '/public/image_d5a16840-c_2026-10-10' },
  { id: 'electronics', image: '/public/image_f75cf397-3_2026-10-10' },
  { id: 'raw', image: '/public/image_7646ff6f-7_2026-10-10' },
  { id: 'packaging', image: '/public/image_d1ef8f2c-6_2026-10-10' },
  { id: 'textiles', image: '/public/image_2a315360-8_2026-10-10' },
  { id: 'construction', image: '/public/image_b98e22de-a_2026-10-10' },
  { id: 'agriculture', image: '/public/image_3817fbdd-2_2026-10-10' },
  { id: 'office', image: '/public/image_1bda0af3-e_2026-10-10' },
  { id: 'services', image: '/public/image_1dceaa9d-e_2026-10-10' },
]

export const STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
]

// 18 suppliers across categories and states. Three are unverified or pending
// so the marketplace's "verified only" filter actually has something to do.
export const SUPPLIERS = [
  { id: 's-arvind', name: 'Arvind Engineering Works', type: 'manufacturer', state: 'Maharashtra', city: 'Pune', verified: true, since: '2023-04-12', about: 'Heavy-duty industrial motors and gearboxes manufactured in Pune since 1998.' },
  { id: 's-shakti', name: 'Shakti Power Components', type: 'trader', state: 'Gujarat', city: 'Ahmedabad', verified: true, since: '2022-09-03', about: 'Authorised distributor of switchgear, MCBs and power capacitors.' },
  { id: 's-steelmark', name: 'Steelmark Industries', type: 'manufacturer', state: 'Karnataka', city: 'Bengaluru', verified: true, since: '2023-01-20', about: 'Cold-rolled steel coils, sheets and precision strips for automotive and white-goods OEMs.' },
  { id: 's-pacflex', name: 'Pacflex Packaging', type: 'manufacturer', state: 'Tamil Nadu', city: 'Chennai', verified: true, since: '2024-02-08', about: 'Custom-printed corrugated boxes, mailer boxes and kraft mailers.' },
  { id: 's-bunkar', name: 'Bunkar Looms', type: 'manufacturer', state: 'Rajasthan', city: 'Jaipur', verified: true, since: '2023-06-14', about: 'Hand-loom cotton and sustainable blended fabrics.' },
  { id: 's-brickworks', name: 'Brickworks Buildsupply', type: 'wholesaler', state: 'Uttar Pradesh', city: 'Lucknow', verified: true, since: '2022-11-30', about: 'Bricks, AAC blocks, cement and steel on bulk supply contracts.' },
  { id: 's-granary', name: 'Granary Foods', type: 'wholesaler', state: 'Punjab', city: 'Ludhiana', verified: true, since: '2023-08-05', about: 'Bulk grains, oilseeds, spices and rice for institutional buyers.' },
  { id: 's-workhive', name: 'WorkHive Supplies', type: 'retailer', state: 'Delhi', city: 'New Delhi', verified: true, since: '2024-05-21', about: 'Office furniture, stationery and ergonomic accessories.' },
  { id: 's-ledgertree', name: 'Ledgertree Services', type: 'service', state: 'Maharashtra', city: 'Mumbai', verified: true, since: '2023-02-18', about: 'GST filings, accounting and compliance for small businesses.' },
  { id: 's-voltcraft', name: 'Voltcraft Electronics', type: 'manufacturer', state: 'Karnataka', city: 'Bengaluru', verified: 'under_review', since: '2024-09-01', about: 'PCB assembly, prototyping and low-volume electronics manufacturing.' },
  { id: 's-bharatkit', name: 'Bharat Hardware', type: 'trader', state: 'Madhya Pradesh', city: 'Indore', verified: true, since: '2023-10-11', about: 'Industrial fasteners, bearings and hand tools.' },
  { id: 's-jutekart', name: 'JuteKart Naturals', type: 'manufacturer', state: 'West Bengal', city: 'Kolkata', verified: true, since: '2024-06-25', about: 'Jute bags, hessian cloth and biodegradable packaging.' },
  { id: 's-onwardmetal', name: 'Onward Metal Castings', type: 'manufacturer', state: 'Haryana', city: 'Gurugram', verified: true, since: '2022-07-09', about: 'Sand-cast iron and aluminium components for industrial machinery.' },
  { id: 's-medishield', name: 'Medishield Hygiene', type: 'distributor', state: 'Kerala', city: 'Kochi', verified: 'under_review', since: '2024-10-15', about: 'Industrial gloves, masks, sterilisers and lab consumables.' },
  { id: 's-goexporters', name: 'GoGlobal Exporters', type: 'exporter', state: 'Goa', city: 'Panaji', verified: true, since: '2023-12-01', about: 'Cashew, spices and seafood exports with end-to-end shipment handling.' },
  { id: 's-pallydrinks', name: 'Pally Foods & Beverages', type: 'manufacturer', state: 'Andhra Pradesh', city: 'Vijayawada', verified: 'pending', since: '2025-01-10', about: 'Mango pulp, fruit concentrates and beverage bases.' },
  { id: 's-trustprint', name: 'Trustprint Graphics', type: 'service', state: 'Telangana', city: 'Hyderabad', verified: true, since: '2022-04-04', about: 'Offset and digital commercial printing.' },
  { id: 's-greenleaf', name: 'Greenleaf Organics', type: 'importer', state: 'Gujarat', city: 'Surat', verified: false, since: '2025-03-22', about: 'Organic raw cocoa and coconut products (verification in progress).' },
]

// 36 products spread across categories and suppliers. Verification flag
// inherits from the supplier. Some products are by-quote-only because their
// price depends on quantity or specification.
export const PRODUCTS = (() => {
  const items = [
    { supplier: 's-arvind', category: 'machinery', name: '5HP Three-Phase Industrial Motor', price: 18400, moq: 2, unit: 'piece', inStock: 84, stockState: 'in_stock', shortDescription: 'Cast-iron housing, IE2 efficiency, suitable for pumps, compressors and conveyors.', specs: ['Power: 5 HP (3.7 kW)', 'Voltage: 415V ±10%', 'Speed: 1440 rpm', 'Frame: 132M', 'Protection: IP55'] },
    { supplier: 's-arvind', category: 'machinery', name: '40:1 Worm Gearbox (60mm shaft)', price: 6900, moq: 5, unit: 'piece', inStock: 120, stockState: 'in_stock', shortDescription: 'Hardened worm, modular housing. Conveyor and mixer drives.', specs: ['Ratio: 40:1', 'Input shaft: 25mm', 'Output shaft: 60mm', 'Torque: 380 Nm'] },
    { supplier: 's-shakti', category: 'electronics', name: 'Triple-Pole MCB 32A C-Curve', price: 320, moq: 50, unit: 'piece', inStock: 4200, stockState: 'in_stock', shortDescription: '10 kA breaking capacity, ISI marked for industrial distribution boards.', specs: ['Current: 32 A', 'Poles: 3', 'Curve: C', 'Breaking capacity: 10 kA'] },
    { supplier: 's-shakti', category: 'electronics', name: 'Power Capacitor 5 kVAr', price: null, byQuote: true, moq: 10, unit: 'piece', inStock: 0, stockState: 'by_quote', shortDescription: 'Self-healing metallised polypropylene. Quoted per quantity.', specs: ['Rating: 5 kVAr', 'Voltage: 440V', 'Type: dry, self-healing'] },
    { supplier: 's-steelmark', category: 'raw', name: 'Cold-Rolled Steel Coil 1.2mm', price: 95, moq: 1000, unit: 'kg', inStock: 28000, stockState: 'in_stock', shortDescription: 'CR grade, annealed, slit-to-width on request.', specs: ['Thickness: 1.2 mm', 'Width: 1250 mm (slitting available)', 'Grade: CR4'] },
    { supplier: 's-steelmark', category: 'raw', name: 'HR Steel Sheet 3mm', price: 78, moq: 2000, unit: 'kg', inStock: 12000, stockState: 'in_stock', shortDescription: 'Hot-rolled, mill edge, suitable for fabrication.', specs: ['Thickness: 3 mm', 'Width: 1500 mm'] },
    { supplier: 's-pacflex', category: 'packaging', name: 'Custom-Printed Mailer Box (10x8x4 in)', price: 28, moq: 500, unit: 'box', inStock: 80000, stockState: 'in_stock', shortDescription: 'Single-colour print, kraft mailer with peel-and-seal strip.', specs: ['Size: 10 x 8 x 4 in', 'GSM: 150', 'Print: 1-colour outside, inside plain'] },
    { supplier: 's-pacflex', category: 'packaging', name: 'Corrugated Shipping Box (18x14x12 in)', price: 56, moq: 200, unit: 'box', inStock: 9300, stockState: 'in_stock', shortDescription: '5-ply BC flute, edge crush tested.', specs: ['Size: 18 x 14 x 12 in', 'Ply: 5', 'ECT: 50 lb/in'] },
    { supplier: 's-bunkar', category: 'textiles', name: 'Hand-Loom Cotton Fabric — Indigo Stripe', price: 410, moq: 50, unit: 'm', inStock: 1400, stockState: 'in_stock', shortDescription: 'Pre-shrunk hand-loom cotton, suitable for apparel and home textiles.', specs: ['Width: 42 in', 'GSM: 180', 'Colour: indigo stripe'] },
    { supplier: 's-bunkar', category: 'textiles', name: 'Sustainable Blend Yarn 30s', price: null, byQuote: true, moq: 100, unit: 'kg', inStock: 0, stockState: 'by_quote', shortDescription: '70/30 recycled cotton-polyester, price on quantity.', specs: ['Count: 30s', 'Blend: 70/30 RC/PET'] },
    { supplier: 's-brickworks', category: 'construction', name: 'AAC Block 600x200x100mm', price: 68, moq: 200, unit: 'piece', inStock: 56000, stockState: 'in_stock', shortDescription: 'Autoclaved aerated concrete, 6 N/mm², lightweight.', specs: ['Size: 600 x 200 x 100 mm', 'Density: 550 kg/m³', 'Compressive: 4 N/mm²'] },
    { supplier: 's-brickworks', category: 'construction', name: 'OPC 53 Grade Cement — 50 kg', price: 410, moq: 100, unit: 'bag', inStock: 9200, stockState: 'in_stock', shortDescription: 'BIS-marked OPC 53 grade, factory-fresh stock.', specs: ['Grade: 53', 'Weight: 50 kg', 'BIS: yes'] },
    { supplier: 's-granary', category: 'agriculture', name: 'Premium Basmati Rice — 1121 Steam', price: 118, moq: 1000, unit: 'kg', inStock: 18000, stockState: 'in_stock', shortDescription: '1121 Sella rice, 7.4 mm average length.', specs: ['Length: 7.4 mm avg', 'Moisture: <12%', 'Broken: <2%'] },
    { supplier: 's-granary', category: 'agriculture', name: 'Turmeric Finger (Polished) — Erode', price: 145, moq: 500, unit: 'kg', inStock: 6300, stockState: 'in_stock', shortDescription: 'Erode turmeric fingers, curcumin 3% min.', specs: ['Origin: Erode', 'Curcumin: 3% min', 'Moisture: 9%'] },
    { supplier: 's-workhive', category: 'office', name: 'Office Desk — 150cm with Cable Tray', price: 11990, moq: 3, unit: 'piece', inStock: 280, stockState: 'in_stock', shortDescription: 'Particle-board desk with levellers and cable management tray.', specs: ['Width: 150 cm', 'Depth: 60 cm', 'Height: 75 cm', 'Top: 25 mm prelam'] },
    { supplier: 's-workhive', category: 'office', name: 'A4 Copier Paper 80 GSM — Carton', price: 2380, moq: 5, unit: 'carton', inStock: 4100, stockState: 'in_stock', shortDescription: '500 sheets per ream, 10 reams per carton.', specs: ['Size: A4 (210x297 mm)', 'GSM: 80', 'Sheets: 500/ream, 10 reams/carton'] },
    { supplier: 's-ledgertree', category: 'services', name: 'Monthly GST Filing — SME Plan', price: 1500, moq: 1, unit: 'month', inStock: 0, stockState: 'by_quote', shortDescription: 'GSTR-1 and GSTR-3B preparation and filing by a chartered accountant.', specs: ['Inclusions: GSTR-1, GSTR-3B', 'Reconciliations: yes', 'Monthly review meeting'] },
    { supplier: 's-voltcraft', category: 'electronics', name: '4-Layer PCB Prototype (100x80mm)', price: null, byQuote: true, moq: 25, unit: 'piece', inStock: 0, stockState: 'by_quote', shortDescription: 'FR-4 substrate, ENIG finish, quote by spec.', specs: ['Layers: 4', 'Finish: ENIG', 'Substrate: FR-4'] },
    { supplier: 's-bharatkit', category: 'machinery', name: 'Hex Bolt M10 x 50mm (Grade 8.8)', price: 4.6, moq: 5000, unit: 'piece', inStock: 280000, stockState: 'in_stock', shortDescription: 'Zinc-plated structural hex bolt.', specs: ['Size: M10 x 50 mm', 'Grade: 8.8', 'Finish: zinc'] },
    { supplier: 's-bharatkit', category: 'machinery', name: 'Deep-Groove Ball Bearing 6205', price: 220, moq: 100, unit: 'piece', inStock: 18000, stockState: 'in_stock', shortDescription: 'Single-row deep-groove ball bearing, ZZ shielded.', specs: ['Bore: 25 mm', 'OD: 52 mm', 'Width: 15 mm', 'Seal: ZZ'] },
    { supplier: 's-jutekart', category: 'packaging', name: 'Jute Carry Bag — 14x12x6 in', price: 42, moq: 200, unit: 'piece', inStock: 26000, stockState: 'in_stock', shortDescription: 'Laminated jute carry bag with cotton handles, custom print on order.', specs: ['Size: 14 x 12 x 6 in', 'Handles: cotton rope', 'Lamination: optional'] },
    { supplier: 's-onwardmetal', category: 'raw', name: 'Aluminium Pressure Die-Cast Housing', price: null, byQuote: true, moq: 500, unit: 'piece', inStock: 0, stockState: 'by_quote', shortDescription: 'ADC12 alloy, machined, quoted per drawing.', specs: ['Alloy: ADC12', 'Finish: as-cast or machined'] },
    { supplier: 's-medishield', category: 'services', name: 'Nitrile Examination Gloves — Box of 100', price: 380, moq: 50, unit: 'box', inStock: 14000, stockState: 'low_stock', shortDescription: 'Powder-free nitrile gloves, 4 mil, blue.', specs: ['Material: nitrile', 'Powder: no', 'Thickness: 4 mil', 'Sizes: M / L'] },
    { supplier: 's-goexporters', category: 'agriculture', name: 'Whole Cashew — W320 Grade', price: 720, moq: 500, unit: 'kg', inStock: 4200, stockState: 'in_stock', shortDescription: 'Goa-origin cashew kernels, W320 count.', specs: ['Grade: W320', 'Origin: Goa', 'Moisture: <5%'] },
    { supplier: 's-pallydrinks', category: 'agriculture', name: 'Totapuri Mango Pulp — Aseptic 215L', price: 94, moq: 1, unit: 'drum', inStock: 380, stockState: 'in_stock', shortDescription: 'Aseptic totapuri mango pulp, 28-30 Brix.', specs: ['Brix: 28-30', 'Pack: 215 L aseptic bag in drum'] },
    { supplier: 's-trustprint', category: 'services', name: 'Brochure Print Run — A4, 4-page', price: 11, moq: 1000, unit: 'piece', inStock: 0, stockState: 'by_quote', shortDescription: 'Offset print on 130 GSM art card, quote by quantity.', specs: ['Paper: 130 GSM art card', 'Pages: 4 (A4, double side)', 'Colour: 4+4'] },
    { supplier: 's-workhive', category: 'office', name: 'Mesh Ergonomic Office Chair', price: 6290, moq: 5, unit: 'piece', inStock: 96, stockState: 'low_stock', shortDescription: 'Breathable mesh back, lumbar support, BIFMA-rated base.', specs: ['Back: mesh', 'Lumbar: adjustable', 'Base: 5-star nylon', 'Warranty: 1 year'] },
    { supplier: 's-arvind', category: 'machinery', name: 'Bench Grinder 200mm with Wheels', price: 7400, moq: 4, unit: 'piece', inStock: 64, stockState: 'in_stock', shortDescription: '200mm bench grinder with coarse and fine wheels, eye shields included.', specs: ['Wheel: 200 x 25 mm', 'Power: 0.5 HP', 'Speed: 2850 rpm'] },
    { supplier: 's-shakti', category: 'electronics', name: 'Three-Phase Energy Meter 100A', price: 4180, moq: 10, unit: 'piece', inStock: 940, stockState: 'in_stock', shortDescription: 'Static 3-phase meter, BIS-marked, tamper detection.', specs: ['Current: 100 A', 'Class: 1.0', 'Voltage: 415V'] },
    { supplier: 's-pacflex', category: 'packaging', name: 'Bubble Wrap Roll 1m x 50m', price: 1480, moq: 20, unit: 'roll', inStock: 1700, stockState: 'in_stock', shortDescription: 'Air bubble protective wrap, 10mm bubble.', specs: ['Width: 1 m', 'Length: 50 m', 'Bubble: 10 mm'] },
    { supplier: 's-brickworks', category: 'construction', name: 'TMT Steel Bar 12mm — Fe 500D', price: 71, moq: 1000, unit: 'kg', inStock: 22000, stockState: 'in_stock', shortDescription: 'Thermo-mechanically treated rebar, Fe 500D grade.', specs: ['Diameter: 12 mm', 'Grade: Fe 500D'] },
    { supplier: 's-granary', category: 'agriculture', name: 'Cold-Pressed Groundnut Oil — 15L Tin', price: 3450, moq: 10, unit: 'tin', inStock: 540, stockState: 'in_stock', shortDescription: 'Wood-pressed groundnut oil, unrefined.', specs: ['Volume: 15 L', 'Process: wood-pressed', 'Filter: none'] },
    { supplier: 's-jutekart', category: 'textiles', name: 'Hessian Cloth 100 GSM — 1m Roll', price: 96, moq: 200, unit: 'm', inStock: 14000, stockState: 'in_stock', shortDescription: 'Natural hessian cloth for agricultural and industrial use.', specs: ['GSM: 100', 'Width: 1 m'] },
    { supplier: 's-bunkar', category: 'textiles', name: 'Block-Print Cotton — Jaipur Floral', price: 360, moq: 80, unit: 'm', inStock: 1100, stockState: 'in_stock', shortDescription: 'Hand block-printed cotton, natural dyes.', specs: ['Width: 44 in', 'Process: hand block print', 'Dye: natural'] },
    { supplier: 's-greenleaf', category: 'agriculture', name: 'Raw Cocoa Nibs — Organic', price: 410, moq: 200, unit: 'kg', inStock: 3800, stockState: 'in_stock', shortDescription: 'Fermented, dried, lightly roasted cocoa nibs.', specs: ['Fermentation: 5-7 days', 'Roast: light'] },
  ]

  return items.map((item, index) => {
    const supplier = SUPPLIERS.find((s) => s.id === item.supplier)
    const verified = supplier.verified === true
    return {
      id: `p-${String(index + 1).padStart(3, '0')}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      category: item.category,
      name: item.name,
      shortDescription: item.shortDescription,
      specs: item.specs,
      price: item.price,
      byQuote: !!item.byQuote,
      moq: item.moq,
      unit: item.unit,
      inStock: item.inStock,
      stockState: item.stockState,
      verified,
      shipping: 'Standard dispatch in 2–4 business days. Custom orders quoted per request.',
      listedAt: '2024-12-01',
      image: categoryImage(item.category),
    }
  })
})()

function categoryImage(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.image
}

// Demo accounts. Seeded once on first load; reset by the demo button.
export const DEMO_ACCOUNTS = [
  {
    id: 'demo-buyer-1',
    role: 'buyer',
    email: 'asha.kapoor@example.in',
    password: 'demo1234',
    profile: { fullName: 'Asha Kapoor', businessName: 'Brightline Textiles', state: 'Karnataka', city: 'Bengaluru' },
  },
  {
    id: 'demo-seller-1',
    role: 'seller',
    email: 'ravi.patel@example.in',
    password: 'demo1234',
    profile: { fullName: 'Ravi Patel', businessName: 'Pacflex Packaging', state: 'Tamil Nadu', city: 'Chennai', supplierLink: 's-pacflex' },
  },
  {
    id: 'demo-admin-1',
    role: 'admin',
    email: 'admin@allbusinesses.local',
    password: 'demo1234',
    profile: { fullName: 'Marketplace Admin' },
  },
]

// Helper export: how many testimonials/quotes per supplier, used in supplier
// profiles to give the page texture without inventing numbers.
export const QUOTE_TEMPLATES = [
  'We placed a bulk order for {{count}} {{unit}} last quarter; delivery and quality were on point.',
  'Sourced {{product}} for our store chain and the supplier coordinated packaging exactly to spec.',
  'We use this supplier regularly for our contract-manufacturing needs. Pricing and lead times are consistent.',
]

// A few canned FAQ answers used by the chat fallback. Lives in translations so
// the assistant can match suggested questions to the right answer.
