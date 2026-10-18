const DEALERS_KEY = "pareekx_dealers";
const SALESPERSONS_KEY = "pareekx_salespersons";

const INITIAL_DEALERS = [
  {
    id: 1,
    name: "Shree Balaji Traders",
    phone: "+91 98765 11111",
    email: "balaji@pareekx.com",
    address: "Main Road",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492001",
    gst: "22ABCDE1234F1Z5",
    contactPerson: "Rajesh Kumar",
    salespersonId: 1,
    active: true,
    joinedAt: "2026-04-10",
    totalOrders: 42,
    totalQuantity: 920,
    lastOrder: "2026-10-02",
  },
  {
    id: 2,
    name: "Arihant Enterprises",
    phone: "+91 99887 22222",
    email: "arihant@pareekx.com",
    address: "Industrial Area",
    city: "Bhilai",
    state: "Chhattisgarh",
    pincode: "490001",
    gst: "22FGHIJ5678K1Z2",
    contactPerson: "Amit Jain",
    salespersonId: 2,
    active: true,
    joinedAt: "2026-05-02",
    totalOrders: 35,
    totalQuantity: 740,
    lastOrder: "2026-10-02",
  },
  {
    id: 3,
    name: "Om Sai Distributors",
    phone: "+91 90000 33333",
    email: "omsai@pareekx.com",
    address: "Station Road",
    city: "Durg",
    state: "Chhattisgarh",
    pincode: "491001",
    gst: "22LMNOP9012Q1Z6",
    contactPerson: "Vikas Verma",
    salespersonId: 3,
    active: true,
    joinedAt: "2026-06-18",
    totalOrders: 21,
    totalQuantity: 460,
    lastOrder: "2026-10-01",
  },
  {
    id: 4,
    name: "New Bharat Agency",
    phone: "+91 91111 44444",
    email: "bharat@pareekx.com",
    address: "City Center",
    city: "Bilaspur",
    state: "Chhattisgarh",
    pincode: "495001",
    gst: "22KLMNO9012P1Z8",
    contactPerson: "Rakesh Singh",
    salespersonId: 1,
    active: false,
    joinedAt: "2026-06-15",
    totalOrders: 7,
    totalQuantity: 125,
    lastOrder: "2026-09-25",
  },
];

const INITIAL_SALESPERSONS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@pareek.com",
    phone: "+91 98765 11111",
    employeeCode: "SP-001",
    city: "Raipur",
    state: "Chhattisgarh",
    joiningDate: "2026-04-10",
    active: true,
  },
  {
    id: 2,
    name: "Amit Verma",
    email: "amit@pareek.com",
    phone: "+91 99887 22222",
    employeeCode: "SP-002",
    city: "Bhilai",
    state: "Chhattisgarh",
    joiningDate: "2026-05-02",
    active: true,
  },
  {
    id: 3,
    name: "Rohit Singh",
    email: "rohit@pareek.com",
    phone: "+91 90000 33333",
    employeeCode: "SP-003",
    city: "Bilaspur",
    state: "Chhattisgarh",
    joiningDate: "2026-06-18",
    active: true,
  },
  {
    id: 4,
    name: "Sanjay Patel",
    email: "sanjay@pareek.com",
    phone: "+91 91111 44444",
    employeeCode: "SP-004",
    city: "Durg",
    state: "Chhattisgarh",
    joiningDate: "2026-07-12",
    active: false,
  },
];

/* =========================================================
   DEALERS
========================================================= */

export const getDealers = () => {
  try {
    const stored = localStorage.getItem(DEALERS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    localStorage.setItem(
      DEALERS_KEY,
      JSON.stringify(INITIAL_DEALERS)
    );

    return INITIAL_DEALERS;
  } catch (error) {
    console.error("Failed to load dealers:", error);
    return INITIAL_DEALERS;
  }
};

export const saveDealers = (dealers) => {
  try {
    localStorage.setItem(
      DEALERS_KEY,
      JSON.stringify(dealers)
    );

    /*
     * Notify all pages/components that dealer data changed.
     */
    window.dispatchEvent(
      new CustomEvent("pareekx-dealers-updated")
    );
  } catch (error) {
    console.error("Failed to save dealers:", error);
  }
};

/* =========================================================
   SALESPERSONS
========================================================= */

export const getSalespersons = () => {
  try {
    const stored = localStorage.getItem(SALESPERSONS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    localStorage.setItem(
      SALESPERSONS_KEY,
      JSON.stringify(INITIAL_SALESPERSONS)
    );

    return INITIAL_SALESPERSONS;
  } catch (error) {
    console.error("Failed to load salespersons:", error);
    return INITIAL_SALESPERSONS;
  }
};

export const saveSalespersons = (salespersons) => {
  try {
    localStorage.setItem(
      SALESPERSONS_KEY,
      JSON.stringify(salespersons)
    );

    window.dispatchEvent(
      new CustomEvent("pareekx-salespersons-updated")
    );
  } catch (error) {
    console.error("Failed to save salespersons:", error);
  }
};

/* =========================================================
   SALESPERSON HELPERS
========================================================= */

export const getSalespersonById = (id) => {
  return getSalespersons().find(
    (person) => String(person.id) === String(id)
  );
};

/* =========================================================
   DEALER ↔ SALESPERSON
========================================================= */

export const getDealersBySalesperson = (salespersonId) => {
  return getDealers().filter(
    (dealer) =>
      String(dealer.salespersonId) === String(salespersonId)
  );
};

export const assignDealerToSalesperson = (
  dealerId,
  salespersonId
) => {
  const dealers = getDealers();

  const updatedDealers = dealers.map((dealer) =>
    String(dealer.id) === String(dealerId)
      ? {
          ...dealer,
          salespersonId: salespersonId
            ? Number(salespersonId)
            : null,
        }
      : dealer
  );

  saveDealers(updatedDealers);

  return updatedDealers;
};

export const removeDealerFromSalesperson = (dealerId) => {
  return assignDealerToSalesperson(dealerId, null);
};