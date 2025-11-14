# Lord of the Rings API Scraper

<div align="center">
  <img src="https://raw.githubusercontent.com/apify/actor-templates/master/templates/scraping/README_images/lotr-banner.png" alt="Lord of the Rings API Scraper" width="800"/>
  <p><em>Extract comprehensive data from "The One API to rule them all" - the definitive Lord of the Rings API</em></p>
</div>

---

## 📋 Table of Contents

- [What This Actor Does](#-what-this-actor-does)
- [Key Features](#-key-features)
- [Input Parameters](#-input-parameters)
- [Output Data Structure](#-output-data-structure)
- [Usage Examples](#-usage-examples)
- [Advanced Configuration](#-advanced-configuration)
- [Use Cases](#-use-cases)
- [API Information](#-api-information)
- [Limits & Considerations](#-limits--considerations)

---

## 🎯 What This Actor Does

This powerful data extraction tool connects to **The One API** (the-one-api.dev) to scrape comprehensive information about J.R.R. Tolkien's legendary Middle-earth universe. Whether you're building a fan application, conducting literary research, or creating educational content, this actor provides structured access to:

- **Complete book catalog** from The Lord of the Rings and The Hobbit series
- **Detailed movie information** including budgets, awards, and box office performance
- **Rich character profiles** with races, realms, relationships, and lore
- **Iconic movie quotes** with character and film attribution
- **Book chapter breakdowns** with detailed references

Perfect for Tolkien enthusiasts, game developers, researchers, and anyone exploring Middle-earth!

---

## 🚀 Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎭 **Multi-Entity Support** | Scrape books, movies, characters, quotes, and chapters |
| 🔍 **Advanced Filtering** | Entity-specific filters for precise data extraction |
| 📊 **Smart Pagination** | Automatic handling of API limits with configurable page sizes |
| ⚡ **Rate Limit Management** | Built-in throttling to respect API constraints |
| 🔄 **Error Recovery** | Robust retry logic for reliable data collection |
| 📈 **Structured Output** | Clean JSON data ready for analysis and integration |
| 🎛️ **Flexible Sorting** | Multiple sort options for organized results |
| 🔐 **Secure Authentication** | Pre-configured API access (no manual setup required) |

</div>

---

## 🔧 Input Parameters

Configure your data extraction job using these comprehensive parameters:

### Core Settings

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `entity` | Select | ✅ Yes | `character` | Choose the type of data to extract |
| `limit` | Integer | ❌ No | `100` | Number of results per page (1-100) |
| `maxPages` | Integer | ❌ No | `10` | Maximum number of pages to fetch |

### Sorting Options

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | Select | ❌ No | `name:asc` | Sort results by field and direction |

**Available Sort Options:**
- `name:asc` / `name:desc` - Alphabetical sorting
- `runtimeInMinutes:asc` / `runtimeInMinutes:desc` - Movie duration
- `budgetInMillions:desc` - Movie budget (highest first)
- `academyAwardWins:desc` - Oscar wins (highest first)

### Entity-Specific Filters

#### Character Filters
```json
{
  "race": "Hobbit",
  "gender": "Female",
  "realm": "The Shire"
}
```

| Filter | Type | Description | Example Values |
|--------|------|-------------|----------------|
| `race` | Select | Character race | `Hobbit`, `Elf`, `Dwarf`, `Human`, `Orc` |
| `gender` | Select | Character gender | `Male`, `Female` |
| `realm` | Text | Geographic realm | `The Shire`, `Mordor`, `Rivendell` |

#### Movie Filters
```json
{
  "budgetInMillions": 100,
  "academyAwardWins": 2,
  "rottenTomatoesScore": 90
}
```

| Filter | Type | Description | Range |
|--------|------|-------------|-------|
| `budgetInMillions` | Number | Minimum budget in millions | 0-∞ |
| `academyAwardWins` | Integer | Minimum Oscar wins | 0-∞ |
| `rottenTomatoesScore` | Integer | Minimum RT score | 0-100 |

#### Quote Filters
```json
{
  "character": "5cd99d4bde30eff6ebccfd81",
  "movie": "5cd95395de30eff6ebccde5b"
}
```

| Filter | Type | Description |
|--------|------|-------------|
| `character` | Text | Character ID for quote filtering |
| `movie` | Text | Movie ID for quote filtering |

#### Chapter Filters
```json
{
  "book": "5cf5805fb53e011a64671582"
}
```

| Filter | Type | Description |
|--------|------|-------------|
| `book` | Text | Book ID for chapter filtering |

### Advanced Filters
```json
{
  "customFilters": {
    "name": "/foot/i",
    "height": {"$exists": true}
  }
}
```

Use MongoDB-style query syntax for complex filtering requirements.

---

## 📊 Output Data Structure

### Character Records
```json
{
  "id": "5cd99d4bde30eff6ebccfbbe",
  "name": "Frodo Baggins",
  "race": "Hobbit",
  "gender": "Male",
  "height": "1.06m (3'6\")",
  "hair": "Brown",
  "realm": "The Shire",
  "birth": "September 22, 2968",
  "spouse": null,
  "death": "FO 61",
  "wikiUrl": "http://lotr.wikia.com//wiki/Frodo_Baggins",
  "url": "https://the-one-api.dev/v2/character/5cd99d4bde30eff6ebccfbbe",
  "source": "the-one-api.dev"
}
```

### Movie Records
```json
{
  "id": "5cd95395de30eff6ebccde5b",
  "name": "The Fellowship of the Ring",
  "runtimeInMinutes": 178,
  "budgetInMillions": 93,
  "boxOfficeRevenueInMillions": 871.5,
  "academyAwardNominations": 13,
  "academyAwardWins": 4,
  "rottenTomatoesScore": 91,
  "url": "https://the-one-api.dev/v2/movie/5cd95395de30eff6ebccde5b",
  "source": "the-one-api.dev"
}
```

### Quote Records
```json
{
  "id": "5cd96e05de30eff6ebcce7f89",
  "dialog": "You shall not pass!",
  "movie": "5cd95395de30eff6ebccde5b",
  "character": "5cd99d4bde30eff6ebccfd81",
  "url": "https://the-one-api.dev/v2/quote/5cd96e05de30eff6ebcce7f89",
  "source": "the-one-api.dev"
}
```

---

## 🎯 Usage Examples

### Basic Character Extraction
Extract all characters from Middle-earth:
```json
{
  "entity": "character",
  "limit": 50,
  "maxPages": 5
}
```

### Find Hobbits Only
Get detailed information about all Hobbit characters:
```json
{
  "entity": "character",
  "characterFilters": {
    "race": "Hobbit"
  },
  "sort": "name:asc"
}
```

### Movie Statistics
Extract comprehensive movie data with filtering:
```json
{
  "entity": "movie",
  "movieFilters": {
    "academyAwardWins": 1
  },
  "sort": "academyAwardWins:desc"
}
```

### Iconic Quotes
Collect famous quotes from specific movies:
```json
{
  "entity": "quote",
  "quoteFilters": {
    "movie": "5cd95395de30eff6ebccde5b"
  },
  "limit": 25
}
```

### Book Chapters
Explore the structure of Tolkien's books:
```json
{
  "entity": "chapter",
  "chapterFilters": {
    "book": "5cf5805fb53e011a64671582"
  }
}
```

### Advanced Filtering
Use regex and complex queries:
```json
{
  "entity": "character",
  "customFilters": {
    "name": "/foot/i",
    "realm": "The Shire"
  }
}
```

---

## ⚙️ Advanced Configuration

### Optimizing Data Collection

**For Large Datasets:**
- Increase `maxPages` for complete data extraction
- Use `limit: 100` for maximum efficiency
- Apply specific filters to reduce result sets

**Rate Limit Management:**
- Actor automatically handles API throttling
- Respects 100 requests per 10-minute limit
- Includes automatic retry logic for failed requests

**Data Filtering Strategies:**
- Use entity-specific filters for targeted extraction
- Combine multiple filter criteria for precise results
- Leverage custom filters for complex queries

### Best Practices

- **Start Small**: Begin with `limit: 10` and `maxPages: 1` for testing
- **Filter Early**: Apply filters to reduce API calls and processing time
- **Monitor Usage**: Track your API quota usage for large extractions
- **Sort Strategically**: Use sorting to organize results for easier analysis

---

## 💡 Use Cases

<div align="center">

### 🎮 Game Development
- Character databases for RPG games
- Lore integration for fantasy titles
- Quote systems for interactive storytelling

### 📚 Academic Research
- Literary analysis of Tolkien's works
- Character relationship mapping
- Thematic studies of Middle-earth

### 🌐 Web Applications
- Fan wikis and databases
- Interactive character finders
- Quote generators and displays

### 📊 Data Analysis
- Movie performance analytics
- Character demographics studies
- Content categorization projects

### 🎓 Education
- Literature study aids
- Fantasy world-building resources
- Cultural studies materials

</div>

---

## 🔗 API Information

**Base URL:** `https://the-one-api.dev/v2`

**Authentication:** Bearer token (pre-configured)

**Rate Limits:** 100 requests per 10 minutes

**Supported Endpoints:**
- `/book` - Book catalog
- `/movie` - Movie trilogy data
- `/character` - Character profiles
- `/quote` - Movie quotes
- `/chapter` - Book chapters

**Response Format:** JSON with pagination metadata

---

## ⚠️ Limits & Considerations

### API Constraints
- **Rate Limit:** 100 requests per 10 minutes
- **Pagination:** Maximum 100 results per page
- **Authentication:** Required for most endpoints
- **Data Freshness:** API maintained by community

### Actor Limitations
- **Memory Usage:** Large datasets may require careful pagination
- **Processing Time:** Complex filters may increase execution time
- **Result Size:** Consider dataset size limits on Apify platform

### Data Coverage
- **Complete Universe:** All major characters, locations, and events
- **Multiple Adaptations:** Books, movies, and extended lore
- **Rich Metadata:** Comprehensive attributes for each entity

---

## 📈 Performance Tips

- **Use Filters:** Reduce data volume with targeted filtering
- **Optimize Pagination:** Balance `limit` and `maxPages` for efficiency
- **Monitor Progress:** Check actor logs for processing status
- **Batch Processing:** Split large extractions into multiple runs

---

## 🤝 Support & Resources

**Need Help?**
- Check the [API Documentation](https://the-one-api.dev/documentation)
- Review [Apify Platform Documentation](https://docs.apify.com)
- Explore community resources and examples

**Contributing:**
Found an issue or have suggestions? Check our contribution guidelines.

---

<div align="center">

**Ready to explore Middle-earth? Start scraping Tolkien's universe today!**

[![Run on Apify](https://img.shields.io/badge/Run%20on-Apify-6C5CE7?style=for-the-badge&logo=apify)](https://apify.com/)

*Built for Tolkien enthusiasts, developers, and researchers worldwide*

</div>

---

## 🔍 SEO Keywords

lord of the rings api, tolkien data, middle earth scraper, fantasy database, character extraction, movie quotes api, book chapters, tolkien research, fantasy lore, middle earth data, lotr api, tolkien characters, fantasy world data, lord of the rings database, tolkien quotes, middle earth characters, fantasy api, tolkien books, lotr movies, tolkien chapters
