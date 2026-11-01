#!/usr/bin/env python3
"""식약처 식품영양성분 DB(공공데이터포털 표준데이터) CSV → 앱 내장 data/mfds.json

사용: python3 scripts/build-mfds.py [CSV 폴더=~/rb-data/mfds]
원본 CSV 는 저장소에 넣지 않습니다. 결과 파일만 앱 번들(www/data)에 들어가고,
검색은 폰 안에서만 합니다(검색할 때 네트워크 요청 없음).

형식(열 단위로 작게): { v, date, source, makers: [...], rows: [[이름, 업체번호(-1 없음), 구분(0 음식/1 가공/2 원재료), 단위(0 g/1 ml), 1회 중량(0 없음), kcal, 탄, 단, 지], ...] }
영양값은 100g(또는 100ml) 기준.
"""
import csv, json, os, re, sys

SRC = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else '~/rb-data/mfds')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'mfds.json')
FILES = [('food_15100070.csv', 0), ('processed_15100066.csv', 1), ('raw_15100065.csv', 2)]
NONE = {'', '해당없음', '없음', '-', 'null', 'NULL'}

def num(s):
    s = (s or '').strip().replace(',', '')
    try:
        v = float(s)
        return v if v == v else None
    except ValueError:
        return None

def r1(v):
    v = round(v or 0, 1)
    return int(v) if v == int(v) else v

def clean(name):
    name = (name or '').replace('_', ' ').replace('？', '').replace('\ufffd', '')
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def maker_core(m):
    # 같은 회사 공장·지점 표기 차이(예: '씨제이제일제당(주)' / '씨제이제일제당(주)진천BLOSSOMCAMPUS')를 같은 업체로
    m = re.sub(r'\s+', '', m or '')
    m = re.split(r'\(주\)|㈜|주식회사|\(유\)', m.replace('주식회사', '(주)'), maxsplit=1)
    return (m[0] or ''.join(m)).lower()

def weight(s):
    m = re.match(r'^\s*([\d.]+)\s*(g|ml|mL)\s*$', s or '')
    if not m: return 0
    v = num(m.group(1))
    return r1(v) if v and 0 < v < 5000 else 0

makers, maker_ix, rows, seen, dates, dup = [], {}, [], set(), set(), 0
for fname, kind in FILES:
    with open(os.path.join(SRC, fname), encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            kcal = num(r.get('에너지(kcal)'))
            name = clean(r.get('식품명'))
            if kcal is None or not name: continue
            unit = 1 if 'ml' in (r.get('영양성분함량기준량') or '').lower() else 0
            maker = ''
            for k in ('제조사명', '수입업체명', '유통업체명'):
                v = (r.get(k) or '').strip()
                if v not in NONE: maker = re.sub(r'\s+', ' ', v); break
            w = weight(r.get('식품중량')) or weight(r.get('1회 섭취참고량'))
            row = [name, -1, kind, unit, w, r1(kcal), r1(num(r.get('탄수화물(g)'))), r1(num(r.get('단백질(g)'))), r1(num(r.get('지방(g)')))]
            # 완전 중복(정규화한 이름 + 업체 + 기준 단위 + 중량 + kcal·탄·단·지)은 하나만 남김
            key = (re.sub(r'\s+', '', name).lower(), maker_core(maker), unit, row[4], *row[5:9])
            if key in seen: dup += 1; continue
            if maker:
                if maker not in maker_ix: maker_ix[maker] = len(makers); makers.append(maker)
                row[1] = maker_ix[maker]
            seen.add(key); rows.append(row)
            if r.get('데이터기준일자'): dates.add(r['데이터기준일자'])

os.makedirs(os.path.dirname(OUT), exist_ok=True)
data = {'v': 1, 'date': max(dates) if dates else '', 'source': '식품의약품안전처 식품영양성분 데이터베이스', 'makers': makers, 'rows': rows}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
print(f'{len(rows)} rows (중복 {dup}건 뺌), {len(makers)} makers, {os.path.getsize(OUT)/1e6:.2f}MB → {os.path.normpath(OUT)}')
