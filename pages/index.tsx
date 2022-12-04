import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import styles from "../styles/Home.module.css";

type Post = {
  id: number;
  date: Date;
  title: DataRendered;
  content: DataRendered;
  yoast_head_json: YoastHeadJson;
};

type DataRendered = {
  rendered: string;
};

type YoastHeadJson = {
  title: string;
  og_title: string;
  og_description: string;
  og_image: OGImage[];
};

type OGImage = {
  width: number;
  height: number;
  url: string;
  type: string;
};

export const getServerSideProps: GetServerSideProps<{ post: Post }> = async (
  context: GetServerSidePropsContext
) => {
  const { query } = context;
  const id = query?.p;

  // if (!id) {
  //   return {
  //     props: {},
  //   };
  // }

  const res = await fetch(
    `https://thaiupdates.info/wp-json/wp/v2/posts?include[]=${id}`
  );
  const posts: Post[] = await res.json();
  const post = posts?.[0];

  return {
    props: {
      post,
    },
  };
};

export default function Home({
  post,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useEffect(() => {
    console.log("post :", post);
  }, [post]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{post.title.rendered}</title>
        <meta name="description" content={post.title.rendered} />
        <link rel="icon" href="/favicon.ico" />
        {/* <meta property="og:url" content="your url" /> */}
        {/* <meta property="og:type" content="website" /> */}
        {/* <meta property="fb:app_id" content="your fb id" /> */}
        <meta property="og:title" content={post.yoast_head_json.og_title} />
        {/* <meta name="twitter:card" content="summary" /> */}
        <meta
          property="og:description"
          content={post.yoast_head_json.og_description}
        />
        <meta
          property="og:image"
          content={post.yoast_head_json.og_image[0].url}
        />
      </Head>

      <main className={styles.main}>
        {post && (
          <div key={post.id}>
            <h1 className={styles.title}>{post.title.rendered}</h1>
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            ></div>
          </div>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
