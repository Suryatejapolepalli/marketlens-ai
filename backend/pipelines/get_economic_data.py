from pathlib import Path
import pandas as pd

OUTPUT = Path("data/processed/economic_data.csv")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

INDICATORS = {
    "FEDFUNDS": "fed_funds_rate",
    "CPIAUCSL": "cpi",
    "UNRATE": "unemployment_rate",
    "GDP": "gdp",
    "DGS10": "treasury_10y",
    "DGS2": "treasury_2y",
    "VIXCLS": "vix"
}

all_data = []

for code, name in INDICATORS.items():
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={code}"
    df = pd.read_csv(url)
    df.columns = ["date", "value"]
    df["indicator_code"] = code
    df["indicator_name"] = name
    all_data.append(df)
    print(f"Fetched {name}")

final_df = pd.concat(all_data, ignore_index=True)
final_df.to_csv(OUTPUT, index=False)

print("Saved:", OUTPUT)
print(final_df.shape)