import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server misconfiguration: missing API key." }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const image = formData.get("image") as File | null;
  if (!image) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const plantnetForm = new FormData();
  plantnetForm.append("images", image, image.name || "upload.jpg");
  plantnetForm.append("organs", "auto");

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&include-related-images=false&no-reject=false&lang=en`;

  let plantnetRes: Response;
  try {
    plantnetRes = await fetch(url, { method: "POST", body: plantnetForm });
  } catch {
    return NextResponse.json({ error: "Could not reach identification service. Try again." }, { status: 502 });
  }

  if (plantnetRes.status === 404) {
    return NextResponse.json({ error: "no_match" }, { status: 404 });
  }
  if (plantnetRes.status === 401) {
    return NextResponse.json({ error: "Server misconfiguration: invalid API key." }, { status: 500 });
  }
  if (!plantnetRes.ok) {
    return NextResponse.json({ error: "Identification service error. Try again." }, { status: 502 });
  }

  const data = await plantnetRes.json();
  const results = (data.results ?? []).slice(0, 5).map((r: PlantNetResult) => ({
    scientificName: r.species?.scientificNameWithoutAuthor ?? r.species?.scientificName ?? "Unknown",
    commonNames: r.species?.commonNames ?? [],
    genus: r.species?.genus?.scientificNameWithoutAuthor ?? "",
    family: r.species?.family?.scientificNameWithoutAuthor ?? "",
    score: Math.round((r.score ?? 0) * 100),
  }));

  return NextResponse.json({ results });
}

interface PlantNetResult {
  score?: number;
  species?: {
    scientificName?: string;
    scientificNameWithoutAuthor?: string;
    commonNames?: string[];
    genus?: { scientificNameWithoutAuthor?: string };
    family?: { scientificNameWithoutAuthor?: string };
  };
}
