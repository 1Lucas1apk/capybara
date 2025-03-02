type UserData = {
  lastPublishIds: string[];
  slug: string | null;
};

type CallbackData = {
  title: string;
  content: string;
  source_url: string;
  image: string;
  url: string;
  type: string;
  published_time: Date;
  modified_time: Date;
  author: string;
};

type Database = {
  get: (path: string) => any;
  set: (path: string, value: any) => void;
};

export async function tabnews(
  database: Database,
  callback: (data: CallbackData) => void
) {
  setInterval(async () => {
    let profiles: Record<string, UserData> = database.get("profiles") || {
      NewsletterOficial: {
        lastPublishIds: [],
        slug: null
      }
    };
    
    const configs = database.get("configs") || {};

    for (const guildId in configs) {
      const server = configs[guildId];
      if (Array.isArray(server.listen)) {
        for (const user of server.listen) {
          if (!profiles[user]) {
            profiles[user] = { lastPublishIds: [], slug: null };
          }
        }
      } else if(server.lister == null || server.listen.length == 0) {
        server.listen = ["NewsletterOficial"]
        database.set(`configs.${guildId}.listen`, server.listen)
      }
    }

    for (const user in profiles) {
      const response: any = await fetchNewsFromTabNews(user);
      if (!response) continue;

      const newsList = response.pageProps.contentListFound;
      if (!newsList || newsList.length === 0) continue;

      const newsToCheck = newsList.slice(0, 5);
      for (const news of newsToCheck) {
        if (profiles[user].lastPublishIds.includes(news.id)) continue;

        profiles[user].lastPublishIds.push(news.id);
        profiles[user].slug = news.slug;
        database.set("profiles", profiles);

        const content: any = await fetchContentNewsFromTabNews(user, news.slug);

        if (!content) continue;

        const callbackData: CallbackData = {
          title: content.pageProps.contentFound.title,
          content: content.pageProps.contentFound.body,
          source_url: content.pageProps.contentFound.source_url,
          image: content.pageProps.contentMetadata.image,
          url: content.pageProps.contentMetadata.url,
          type: content.pageProps.contentMetadata.type,
          published_time: new Date(
            content.pageProps.contentMetadata.published_time
          ),
          modified_time: new Date(
            content.pageProps.contentMetadata.modified_time
          ),
          author: content.pageProps.contentMetadata.author
        };

        callback(callbackData);
      }
    }
  }, 2000);
}

export async function fetchNewsFromTabNews(username: string) {
  try {
    const response = await fetch(
      `https://www.tabnews.com.br/_next/data/3pLA3W5RsYsGrkDqxWgmw/pt-BR/${username}/conteudos/1.json`
    );
    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchContentNewsFromTabNews(
  username: string,
  slug: string
) {
  try {
    const response = await fetch(
      `https://www.tabnews.com.br/_next/data/3pLA3W5RsYsGrkDqxWgmw/pt-BR/${username}/${slug}.json`
    );
    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
