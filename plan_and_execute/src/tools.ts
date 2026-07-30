import { tool } from "@openai/agents";
import { z } from "zod";
import * as cheerio from "cheerio";

export const webSearch = tool({
  name: "web_search",

  description: "Search the web.",

  parameters: z.object({
    query: z.string(),
  }),

  execute: async ({ query }) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const html = await fetch(url).then(res => res.text());

    const $ = cheerio.load(html);

    const results = [];

    $(".result").each((_, el) => {
      results.push({
        title: $(el).find(".result__title").text().trim(),
        url: $(el).find("a.result__url").attr("href"),
        snippet: $(el).find(".result__snippet").text().trim(),
      });
    });

    return results;
  },
});