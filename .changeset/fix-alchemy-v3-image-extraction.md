---
'base-mcp': patch
---

Fix `list_nfts` returning `[object Object]` (or an empty string) for the NFT image URL. `fetchNftsFromAlchemy` calls the Alchemy NFT v3 endpoint, but `formatNftData` was parsing the response shape from the v2 API, where `image` was a plain string. In v3 `image` is an object (`{ cachedUrl, originalUrl, pngUrl, thumbnailUrl }`), so the previous `|| nft.image` fallback dropped a whole object into `imageUrl`. `formatNftData` now reads `cachedUrl` / `originalUrl` / `pngUrl` / `thumbnailUrl` in order, and keeps v2 string handling as a fallback.
