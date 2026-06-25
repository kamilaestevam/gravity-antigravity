"""Gera invoice comercial multi-item para testes Smart Read — salva em Downloads."""
from __future__ import annotations

import os
from pathlib import Path

import xlwt
from openpyxl import Workbook
from PIL import Image, ImageDraw, ImageFont

OUT = Path.home() / "Downloads" / "smart-read-invoice-teste"
OUT.mkdir(parents=True, exist_ok=True)

INVOICE = {
    "number": "INV-2026-0042",
    "date": "2026-06-25",
    "seller": "Gravity Export Ltd",
    "buyer": "ACME Import SA",
    "currency": "USD",
    "items": [
        ("WDG-001", "Industrial Widget Type A", 100, "PCS", 10.00),
        ("WDG-002", "Precision Bearing Set", 50, "SET", 25.00),
        ("SRV-010", "Packaging and Handling", 1, "LOT", 150.00),
        ("WDG-003", "Stainless Steel Fasteners M8", 500, "PCS", 0.85),
        ("SRV-011", "Ocean Freight Prepaid", 1, "SHIP", 420.00),
    ],
}


def subtotal() -> float:
    return sum(qty * price for _, _, qty, _, price in INVOICE["items"])


def write_csv() -> None:
    lines = [
        "invoice_number,invoice_date,seller,buyer,currency,line,sku,description,quantity,unit,unit_price,line_total",
    ]
    for i, (sku, desc, qty, unit, price) in enumerate(INVOICE["items"], 1):
        total = qty * price
        lines.append(
            f'{INVOICE["number"]},{INVOICE["date"]},{INVOICE["seller"]},{INVOICE["buyer"]},'
            f'{INVOICE["currency"]},{i},{sku},"{desc}",{qty},{unit},{price:.2f},{total:.2f}'
        )
    lines.append(f',,,,,,,,,SUBTOTAL,{subtotal():.2f}')
    (OUT / "invoice-teste.csv").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_xml() -> None:
    items_xml = []
    for i, (sku, desc, qty, unit, price) in enumerate(INVOICE["items"], 1):
        total = qty * price
        items_xml.append(
            f'  <item line="{i}">\n'
            f"    <sku>{sku}</sku>\n"
            f"    <description>{desc}</description>\n"
            f'    <quantity unit="{unit}">{qty}</quantity>\n'
            f'    <unit_price currency="{INVOICE["currency"]}">{price:.2f}</unit_price>\n'
            f"    <line_total>{total:.2f}</line_total>\n"
            f"  </item>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        "<commercial_invoice>\n"
        "  <header>\n"
        f'    <invoice_number>{INVOICE["number"]}</invoice_number>\n'
        f'    <invoice_date>{INVOICE["date"]}</invoice_date>\n'
        f'    <seller>{INVOICE["seller"]}</seller>\n'
        f'    <buyer>{INVOICE["buyer"]}</buyer>\n'
        f'    <currency>{INVOICE["currency"]}</currency>\n'
        "  </header>\n"
        "  <items>\n"
        + "\n".join(items_xml)
        + "\n  </items>\n"
        "  <totals>\n"
        f"    <subtotal>{subtotal():.2f}</subtotal>\n"
        "  </totals>\n"
        "</commercial_invoice>\n"
    )
    (OUT / "invoice-teste.xml").write_text(xml, encoding="utf-8")


def write_xlsx() -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Invoice"
    ws.append(["COMMERCIAL INVOICE"])
    ws.append(["Invoice No", INVOICE["number"]])
    ws.append(["Date", INVOICE["date"]])
    ws.append(["Seller", INVOICE["seller"]])
    ws.append(["Buyer", INVOICE["buyer"]])
    ws.append([])
    ws.append(["Line", "SKU", "Description", "Qty", "Unit", "Unit Price", "Line Total"])
    for i, (sku, desc, qty, unit, price) in enumerate(INVOICE["items"], 1):
        ws.append([i, sku, desc, qty, unit, price, qty * price])
    ws.append([])
    ws.append(["", "", "", "", "", "SUBTOTAL", subtotal()])
    wb.save(OUT / "invoice-teste.xlsx")


def write_xls() -> None:
    wb = xlwt.Workbook()
    ws = wb.add_sheet("Invoice")
    rows = [
        ["COMMERCIAL INVOICE"],
        ["Invoice No", INVOICE["number"]],
        ["Date", INVOICE["date"]],
        ["Seller", INVOICE["seller"]],
        ["Buyer", INVOICE["buyer"]],
        [],
        ["Line", "SKU", "Description", "Qty", "Unit", "Unit Price", "Line Total"],
    ]
    for i, (sku, desc, qty, unit, price) in enumerate(INVOICE["items"], 1):
        rows.append([i, sku, desc, qty, unit, price, qty * price])
    rows.append([])
    rows.append(["", "", "", "", "", "SUBTOTAL", subtotal()])
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            ws.write(r, c, val)
    wb.save(str(OUT / "invoice-teste.xls"))


def write_invoice_image(path: Path, fmt: str) -> None:
    w, h = 900, 1100
    img = Image.new("RGB", (w, h), "white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        font_b = ImageFont.truetype("arialbd.ttf", 22)
        font_s = ImageFont.truetype("arial.ttf", 14)
    except OSError:
        font = font_b = font_s = ImageFont.load_default()

    y = 40
    draw.text((40, y), "COMMERCIAL INVOICE", fill="#1e3a5f", font=font_b)
    y += 50
    for label, val in [
        ("Invoice No:", INVOICE["number"]),
        ("Date:", INVOICE["date"]),
        ("Seller:", INVOICE["seller"]),
        ("Buyer:", INVOICE["buyer"]),
        ("Currency:", INVOICE["currency"]),
    ]:
        draw.text((40, y), f"{label} {val}", fill="black", font=font)
        y += 28

    y += 10
    headers = ["#", "SKU", "Description", "Qty", "Unit", "Price", "Total"]
    col_x = [40, 70, 150, 480, 540, 610, 700]
    for x, htxt in zip(col_x, headers):
        draw.text((x, y), htxt, fill="#333", font=font_s)
    y += 24
    draw.line([(40, y), (860, y)], fill="#ccc", width=1)
    y += 8

    for i, (sku, desc, qty, unit, price) in enumerate(INVOICE["items"], 1):
        total = qty * price
        row = [str(i), sku, desc[:38], str(qty), unit, f"{price:.2f}", f"{total:.2f}"]
        for x, txt in zip(col_x, row):
            draw.text((x, y), txt, fill="black", font=font_s)
        y += 22

    y += 10
    draw.line([(40, y), (860, y)], fill="#ccc", width=1)
    y += 12
    draw.text((610, y), f"SUBTOTAL: {subtotal():.2f} {INVOICE['currency']}", fill="#1e3a5f", font=font)

    if fmt == "png":
        img.save(path, "PNG")
    else:
        img.convert("RGB").save(path, "JPEG", quality=92)


def main() -> None:
    write_csv()
    write_xml()
    write_xlsx()
    write_xls()
    write_invoice_image(OUT / "invoice-teste.png", "png")
    write_invoice_image(OUT / "invoice-teste.jpg", "jpeg")
    write_invoice_image(OUT / "invoice-teste.jpeg", "jpeg")
    print(f"Arquivos gerados em: {OUT}")
    for name in sorted(os.listdir(OUT)):
        if name.startswith("invoice-teste"):
            print(f"  {name}")


if __name__ == "__main__":
    main()
