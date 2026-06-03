import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "PlantIdentificationApp/1.0 (educational plant id tool)";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ images: [] });
  }

  try {
    // Step 1: resolve the taxon by scientific name
    const taxaUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&rank=species&per_page=1`;
    const taxaRes = await fetch(taxaUrl, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });

    if (!taxaRes.ok) return NextResponse.json({ images: [] });

    const taxaData = await taxaRes.json();
    const taxon = taxaData.results?.[0];
    if (!taxon) return NextResponse.json({ images: [] });

    // Step 2: fetch curated taxon photos
    const taxonUrl = `https://api.inaturalist.org/v1/taxa/${taxon.id}`;
    const taxonRes = await fetch(taxonUrl, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });

    if (!taxonRes.ok) return NextResponse.json({ images: [] });

    const taxonData = await taxonRes.json();
    const taxonDetail = taxonData.results?.[0];
    if (!taxonDetail) return NextResponse.json({ images: [] });

    // taxon_photos is the curated set; fall back to taxon_photos on the basic record
    const photos: InatPhoto[] = taxonDetail.taxon_photos ?? [];

    const images = photos
      .slice(0, 8)
      .map((tp: InatPhoto) => {
        const raw = tp.photo?.url ?? "";
        return {
          url: raw.replace("/square.", "/medium."),
          thumbnail: raw.replace("/square.", "/small."),
          attribution: tp.photo?.attribution ?? "",
          sourceLink: `https://www.inaturalist.org/taxa/${taxon.id}`,
        };
      })
      .filter((img) => img.url);

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}

interface InatPhoto {
  photo?: {
    url?: string;
    attribution?: string;
  };
}
