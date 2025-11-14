// Lord of the Rings API Scraper - API implementation
import { Actor, log } from 'apify';
import { Dataset } from 'crawlee';
import { got } from 'got-scraping';

// Single-entrypoint main
await Actor.init();

async function main() {
    try {
        const input = (await Actor.getInput()) || {};
        const {
            entity = 'character', limit: LIMIT_RAW = 100,
            maxPages: MAX_PAGES_RAW = 10, sort = 'name:asc',
            characterName, characterRace, characterGender,
            movieName, movieRuntimeInMinutes,
            quoteDialog, quoteMovie, quoteCharacter,
            chapterName, chapterBook,
            bookName,
            customFilters = {}
        } = input;

        // Validate inputs
        const validEntities = ['book', 'movie', 'character', 'quote', 'chapter'];
        if (!validEntities.includes(entity)) {
            throw new Error(`Invalid entity: ${entity}. Must be one of: ${validEntities.join(', ')}.`);
        }

        const LIMIT = Number.isFinite(+LIMIT_RAW) ? Math.max(1, Math.min(100, +LIMIT_RAW)) : 100;
        const MAX_PAGES = Number.isFinite(+MAX_PAGES_RAW) ? Math.max(1, +MAX_PAGES_RAW) : 10;

        // Hardcoded API key
        const API_KEY = 'j-gsqpA6ER0VC67iTsD6';

        const baseUrl = `https://the-one-api.dev/v2/${entity}`;
        const perPage = LIMIT; // Use the limit from input

        let saved = 0;
        let page = 1;

        log.info(`Starting scrape: entity=${entity}, limit=${LIMIT}, maxPages=${MAX_PAGES}`);

        while (saved < (LIMIT * MAX_PAGES) && page <= MAX_PAGES) {
            // Build query parameters correctly
            const params = new URLSearchParams();
            
            params.append('limit', perPage.toString());
            params.append('page', page.toString());
            
            if (sort) {
                params.append('sort', sort);
            }
            
            // Combine filters based on entity type
            const combinedFilters = { ...customFilters };
            
            switch (entity) {
                case 'character':
                    if (characterName) combinedFilters.name = characterName;
                    if (characterRace) combinedFilters.race = characterRace;
                    if (characterGender) combinedFilters.gender = characterGender;
                    break;
                case 'movie':
                    if (movieName) combinedFilters.name = movieName;
                    if (movieRuntimeInMinutes) combinedFilters.runtimeInMinutes = movieRuntimeInMinutes;
                    break;
                case 'quote':
                    if (quoteDialog) combinedFilters.dialog = quoteDialog;
                    if (quoteMovie) combinedFilters.movie = quoteMovie;
                    if (quoteCharacter) combinedFilters.character = quoteCharacter;
                    break;
                case 'chapter':
                    if (chapterName) combinedFilters.chapterName = chapterName;
                    if (chapterBook) combinedFilters.book = chapterBook;
                    break;
                case 'book':
                    if (bookName) combinedFilters.name = bookName;
                    break;
            }
            
            // Add filters as query parameters
            if (combinedFilters && typeof combinedFilters === 'object') {
                for (const [key, value] of Object.entries(combinedFilters)) {
                    if (value !== null && value !== undefined && value !== '') {
                        params.append(key, `/${String(value)}/i`);
                    }
                }
            }

            const url = `${baseUrl}?${params.toString()}`;

            log.info(`Fetching page ${page}: ${url}`);

            let response;
            try {
                const headers = {
                    'User-Agent': 'Apify-Lord-of-the-Rings-API-Scraper/1.0 (https://apify.com)',
                    'Accept': 'application/json'
                };
                
                if (API_KEY && entity !== 'book') {
                    headers['Authorization'] = `Bearer ${API_KEY}`;
                }
                
                response = await got(url, {
                    retry: { 
                        limit: 3, 
                        methods: ['GET'],
                        statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524]
                    },
                    timeout: { request: 30000 },
                    headers,
                    responseType: 'json'
                });
            } catch (error) {
                log.error(`Failed to fetch page ${page}: ${error.message}`);
                if (error.response?.statusCode === 429) {
                    log.warning('Rate limit hit, waiting 60 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }
                if (error.response?.statusCode === 401) {
                    log.error('Unauthorized - check API key');
                    throw new Error('API access unauthorized. Please check the hardcoded API key.');
                }
                throw error;
            }

            if (response.statusCode !== 200) {
                throw new Error(`HTTP error! status: ${response.statusCode}, body: ${JSON.stringify(response.body)}`);
            }

            // got-scraping with responseType: 'json' auto-parses
            const data = response.body;

            if (!data || typeof data !== 'object') {
                throw new Error(`Invalid API response format: ${JSON.stringify(data)}`);
            }

            if (!data.docs || !Array.isArray(data.docs)) {
                log.warning(`No docs in response for page ${page}`);
                break;
            }

            if (data.docs.length === 0) {
                log.info(`No more results available at page ${page}`);
                break;
            }

            const items = data.docs;

            // Transform data based on entity
            const transformedItems = [];
            for (const item of items) {
                try {
                    const transformed = await transformItem(item, entity);
                    if (transformed) {
                        transformedItems.push(transformed);
                    }
                } catch (transformError) {
                    log.warning(`Failed to transform item ${item._id}: ${transformError.message}`);
                }
            }
            
            if (transformedItems.length === 0) {
                log.warning('No items successfully transformed');
                break;
            }

            let toSave = Math.min(transformedItems.length, total - saved);
            if (toSave > 0) {
                await Dataset.pushData(transformedItems.slice(0, toSave));
                saved += toSave;
                log.info(`✓ Page ${page}: Saved ${toSave} items. Total: ${saved}`);
            }

            if (toSave < transformedItems.length || data.docs.length < perPage) {
                log.info('Scraping complete - reached limit or end of results');
                break;
            }

            page++;
            
            // Add delay between requests to be polite
            if (page <= MAX_PAGES) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        log.info(`Finished. Saved ${saved} items`);
    } finally {
        await Actor.exit();
    }
}

// Transform item based on entity type
// Helper functions to fetch related data
async function fetchCharacterName(id) {
    if (!id) return null;
    try {
        const url = `https://the-one-api.dev/v2/character/${id}`;
        const response = await got(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            responseType: 'json',
            timeout: { request: 10000 }
        });
        return response.body.docs[0]?.name || null;
    } catch (e) {
        log.warning(`Failed to fetch character name for ${id}: ${e.message}`);
        return null;
    }
}

async function fetchMovieName(id) {
    if (!id) return null;
    try {
        const url = `https://the-one-api.dev/v2/movie/${id}`;
        const response = await got(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            responseType: 'json',
            timeout: { request: 10000 }
        });
        return response.body.docs[0]?.name || null;
    } catch (e) {
        log.warning(`Failed to fetch movie name for ${id}: ${e.message}`);
        return null;
    }
}

async function fetchBookName(id) {
    if (!id) return null;
    try {
        const url = `https://the-one-api.dev/v2/book/${id}`;
        const response = await got(url, {
            responseType: 'json',
            timeout: { request: 10000 }
        });
        return response.body.docs[0]?.name || null;
    } catch (e) {
        log.warning(`Failed to fetch book name for ${id}: ${e.message}`);
        return null;
    }
}

async function transformItem(item, entity) {
    if (!item || typeof item !== 'object') {
        throw new Error('Invalid item: expected object');
    }
    
    const baseItem = {
        id: item._id || null,
        url: item._id ? `https://the-one-api.dev/v2/${entity}/${item._id}` : null,
        source: 'the-one-api.dev'
    };

    switch (entity) {
        case 'book':
            return {
                ...baseItem,
                name: item.name || null
            };
        case 'movie':
            return {
                ...baseItem,
                name: item.name || null,
                runtimeInMinutes: item.runtimeInMinutes || null,
                budgetInMillions: item.budgetInMillions || null,
                boxOfficeRevenueInMillions: item.boxOfficeRevenueInMillions || null,
                academyAwardNominations: item.academyAwardNominations || null,
                academyAwardWins: item.academyAwardWins || null,
                rottenTomatoesScore: item.rottenTomatoesScore || null
            };
        case 'character':
            return {
                ...baseItem,
                name: item.name || null,
                wikiUrl: item.wikiUrl || null,
                race: item.race || null,
                gender: item.gender || null,
                height: item.height || null,
                hair: item.hair || null,
                realm: item.realm || null,
                birth: item.birth || null,
                spouse: item.spouse || null,
                death: item.death || null
            };
        case 'quote':
            const [movieName, characterName] = await Promise.all([
                fetchMovieName(item.movie),
                fetchCharacterName(item.character)
            ]);
            return {
                ...baseItem,
                dialog: item.dialog || null,
                movie: movieName,
                character: characterName
            };
        case 'chapter':
            const bookName = await fetchBookName(item.book);
            return {
                ...baseItem,
                chapterName: item.chapterName || null,
                book: bookName
            };
        default:
            return baseItem;
    }
}

main().catch(err => { console.error(err); process.exit(1); });
