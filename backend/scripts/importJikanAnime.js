const mongoose = require('mongoose');
const axios = require('axios');
const Anime = require('../models/Anime');
const dbConfig = require('../config/db');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const JIKAN_URL = 'https://api.jikan.moe/v4/top/anime?limit=25&page='; // 25 per page, 40 pages = 1000

// 25 per page

async function fetchJikanAnime() {
  let allAnime = [];
  for (let page = 1; page <= 400; page++) {   // loop through 400 pages = 10,000 anime
    console.log(`Fetching page ${page}...`);
    try {
        const res = await axios.get(JIKAN_URL + page);
        allAnime = allAnime.concat(res.data.data);
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        break; 
    }

    // Be nice to the API (Jikan has rate limits: 3 requests/sec per IP, 60/min)
    await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1s delay between requests
  }
  return allAnime;
}


 
async function main() {
  await dbConfig();
  console.log('Connected to DB');

// --------------------------------------------------------------------------------
// 1. Find the maximum existing count using the custom field name
// --------------------------------------------------------------------------------
  const lastAnime = await Anime.findOne().sort({ Indexcountfordatabase: -1 }).select('Indexcountfordatabase');
  let animeCount = (lastAnime && lastAnime.Indexcountfordatabase) ? lastAnime.Indexcountfordatabase + 1 : 1;
  console.log(`Starting anime count from: ${animeCount}`);
// --------------------------------------------------------------------------------

  const jikanAnime = await fetchJikanAnime();
  console.log(`Fetched ${jikanAnime.length} anime from Jikan`);

  // Helper to map Jikan status to allowed enum
  function mapStatus(jikanStatus) {
    if (!jikanStatus) return 'upcoming';
    if (jikanStatus.toLowerCase().includes('airing')) return jikanStatus.toLowerCase().includes('currently') ? 'ongoing' : 'completed';
    if (jikanStatus.toLowerCase().includes('not yet')) return 'upcoming';
    return 'upcoming';
  }

  for (const a of jikanAnime) {
    const exists = await Anime.findOne({ mal_id: a.mal_id });
    if (exists) continue;
    
// --------------------------------------------------------------------------------
// 2. Assign the current count and increment the counter
// --------------------------------------------------------------------------------
    const currentCount = animeCount++; 
// --------------------------------------------------------------------------------

    const anime = new Anime({
      // 3. Assign the value to the custom field name
      Indexcountfordatabase: currentCount, 
      
      mal_id: a.mal_id,
      title: a.title,
      title_english: a.title_english,
      title_japanese: a.title_japanese,
      title_synonyms: a.title_synonyms,
      description: a.synopsis || '',
      background: a.background || '',
      coverImage: a.images?.jpg?.image_url || '',
      bannerImage: a.images?.jpg?.large_image_url || '',
      trailer: a.trailer || {},
      producers: a.producers || [],
      studios: a.studios || [],
      licensors: a.licensors || [],
      aired: {
        from: a.aired?.from ? new Date(a.aired.from) : undefined,
        to: a.aired?.to ? new Date(a.aired.to) : undefined,
        string: a.aired?.string || ''
      },
      duration: a.duration,
      year: a.year,
      status: mapStatus(a.status),
      genres: (a.genres || []).map(g => g.name),
      tags: (a.themes || []).map(t => t.name),
      totalEpisodes: a.episodes || 0,
      score: a.score || 0,
      scored_by: a.scored_by,
      rank: a.rank,
      popularity: a.popularity,
      members: a.members,
      favorites: a.favorites,
      rating: a.rating,
      source: 'jikan',
    });
    await anime.save();
    console.log(`Saved: [${currentCount}] ${anime.title}`);
  }
  console.log('Import complete!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });