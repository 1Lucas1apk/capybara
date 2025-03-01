export async function tabnews(database, callback) {
  const guilds = Object.keys(database.get("configs"))
  
  for (const guildId of guilds) {
    setInterval(async () => {
    let data = database.get(`configs.${guildId}.users`) || {
      NewsletterOficial: {
        lastPublishIds: [],
        slug: null,
      },
    }

    Object.keys(data).forEach(async (user) => {
      let response: any = await fetchNewsFromTabNews(user);
      if (!response) return;

      const newsList = response.pageProps.contentListFound;
      if (!newsList || newsList.length === 0) {
        console.log(`Usuário ${user} não tem nenhuma postagem`);
        return;
      }

      const newsToCheck = newsList.slice(0, 5);

      for (const news of newsToCheck) {
        if (!data[user].lastPublishIds) data[user].lastPublishIds = [];
        if (data[user].lastPublishIds.includes(news.id)) continue;
        
        console.log(`Nova postagem de ${user}: ${news.title}`);
        data[user].lastPublishIds.push(news.id);
        data[user].slug = news.slug;
        
        database.set(`configs.${guildId}.users`, data);

        let content: any = await fetchContentNewsFromTabNews(user, news.slug);
        if (!content) continue;
        console.log("Obtendo conteúdo de:", user, news.slug);

        callback({
          title: content.pageProps.contentFound.title,
          content: content.pageProps.contentFound.body,
          source_url: content.pageProps.contentFound.source_url,
          image: content.pageProps.contentMetadata.image,
          url: content.pageProps.contentMetadata.url,
          type: content.pageProps.contentMetadata.type,
          published_time: new Date(content.pageProps.contentMetadata.published_time),
          modified_time: new Date(content.pageProps.contentMetadata.modified_time),
          author: content.pageProps.contentMetadata.author,
        });
      }
    });
  }, 20000);
}
}

export async function fetchNewsFromTabNews(username) {
  let data = await fetch(`https://www.tabnews.com.br/_next/data/3pLA3W5RsYsGrkDqxWgmw/pt-BR/${username}/conteudos/1.json`)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });

  if (!data) return null;
  return data;
}

export async function fetchContentNewsFromTabNews(username, slug) {
  let data = await fetch(`https://www.tabnews.com.br/_next/data/3pLA3W5RsYsGrkDqxWgmw/pt-BR/${username}/${slug}.json`)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });

  if (!data) return null;
  return data;
}
