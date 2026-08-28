export const CAMPUS_LOCATIONS = [
    {
        id: "university-gate",
        name: "University gate area",
        position: [11.982806, 124.817722],
        radius: 30,
    },
    {
        id: "covered-court",
        name: "Covered court",
        position: [11.982417, 124.817778],
        radius: 50,
    },
    {
        id: "registrars-office",
        name: "Registrar's office area",
        position: [11.982300, 124.816900],
        radius: 35,
    },
    {
        id: "library",
        name: "Library area",
        position: [11.982056, 124.816639],
        radius: 40,
    },
    {
        id: "canteen",
        name: "Canteen area",
        position: [11.981917, 124.817083],
        radius: 35,
    },
    {
        id: "computer-lab",
        name: "Computer laboratory",
        position: [11.982250, 124.817400],
        radius: 30,
    },
    {
        id: "nachura-hall",
        name: "Nachura hall building",
        position: [11.982500, 124.817000],
        radius: 40,
    },
    {
        id: "agriculture",
        name: "Agriculture department area",
        position: [11.981700, 124.817500],
        radius: 45,
    },
];

{
    const seenIds = new Set();
    const seenNames = new Set();

    for (const loc of CAMPUS_LOCATIONS) {
        if (seenIds.has(loc.id)) {
            throw new Error(`Duplicate location id: "${loc.id}"`);
        }
        seenIds.add(loc.id);

        if (seenNames.has(loc.name)) {
            throw new Error(`Duplicate location name: "${loc.name}"`);
        }
        seenNames.add(loc.name);

        if (!Number.isFinite(loc.radius) || loc.radius <= 0) {
            throw new Error(`Invalid radius for "${loc.id}": ${loc.radius}`);
        }

        const [lat, lng] = loc.position;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new Error(`Invalid position for "${loc.id}": ${loc.position}`);
        }
    }
}

export const LOCATION_NAMES = CAMPUS_LOCATIONS.map((loc) => loc.name);

export const CAMPUS_LOCATION_BY_NAME = Object.fromEntries(
    CAMPUS_LOCATIONS.map((loc) => [loc.name, loc])
);

export const DEFAULT_MAP_CENTER = [11.98211, 124.81726];