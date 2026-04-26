# Graph Report - D:\Project\gOOG  (2026-04-22)

## Corpus Check
- 11 files · ~5,547 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 34 nodes · 32 edges · 10 communities detected
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `mock_crawler_scan()` - 6 edges
2. `Mock endpoint that a crawler would hit when it finds an image on the web.` - 4 edges
3. `generate_phash()` - 4 edges
4. `upload_asset()` - 3 edges
5. `Asset` - 3 edges
6. `Violation` - 3 edges
7. `evaluate_violation()` - 3 edges
8. `calculate_distance()` - 3 edges
9. `Organization` - 2 edges
10. `Mocked Claude API Integration.     In a real app, we would send the image and co` - 1 edges

## Surprising Connections (you probably didn't know these)
- `upload_asset()` --calls--> `generate_phash()`  [INFERRED]
  D:\Project\gOOG\backend\app.py → D:\Project\gOOG\backend\services\fingerprint.py
- `mock_crawler_scan()` --calls--> `generate_phash()`  [INFERRED]
  D:\Project\gOOG\backend\app.py → D:\Project\gOOG\backend\services\fingerprint.py
- `mock_crawler_scan()` --calls--> `calculate_distance()`  [INFERRED]
  D:\Project\gOOG\backend\app.py → D:\Project\gOOG\backend\services\fingerprint.py
- `mock_crawler_scan()` --calls--> `evaluate_violation()`  [INFERRED]
  D:\Project\gOOG\backend\app.py → D:\Project\gOOG\backend\services\ai.py
- `upload_asset()` --calls--> `Asset`  [INFERRED]
  D:\Project\gOOG\backend\app.py → D:\Project\gOOG\backend\models.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (6): mock_crawler_scan(), Mock endpoint that a crawler would hit when it finds an image on the web., upload_asset(), Asset, Organization, Violation

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.4
Nodes (4): calculate_distance(), generate_phash(), Calculate Hamming distance between two hash strings., Generate a perceptual hash for an image file.     Tolerates compression, resizin

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (2): evaluate_violation(), Mocked Claude API Integration.     In a real app, we would send the image and co

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **3 isolated node(s):** `Mocked Claude API Integration.     In a real app, we would send the image and co`, `Generate a perceptual hash for an image file.     Tolerates compression, resizin`, `Calculate Hamming distance between two hash strings.`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 4`** (2 nodes): `mock_crawler.py`, `run_crawler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `Dashboard.jsx`, `Dashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mock_crawler_scan()` connect `Community 0` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `evaluate_violation()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `generate_phash()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `mock_crawler_scan()` (e.g. with `generate_phash()` and `calculate_distance()`) actually correct?**
  _`mock_crawler_scan()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Mock endpoint that a crawler would hit when it finds an image on the web.` (e.g. with `Organization` and `Asset`) actually correct?**
  _`Mock endpoint that a crawler would hit when it finds an image on the web.` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `generate_phash()` (e.g. with `upload_asset()` and `mock_crawler_scan()`) actually correct?**
  _`generate_phash()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `upload_asset()` (e.g. with `generate_phash()` and `Asset`) actually correct?**
  _`upload_asset()` has 2 INFERRED edges - model-reasoned connections that need verification._