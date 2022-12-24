import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect } from "react";
import styles from "../styles/Home.module.css";

type Post = {
  id: number;
  date: Date;
  guid: DataRendered;
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

const { NEXT_PUBLIC_WP_BASE_URL, NEXT_PUBLIC_WP_TITLE } = process.env;

export const getServerSideProps: GetServerSideProps<{
  env: any;
  redirect: boolean;
  post: Post | null;
}> = async (context: GetServerSidePropsContext) => {
  const { query } = context;
  const id = query?.p;
  const redirect = !!query?.redirect;
  const env = process.env;

  if (!id) {
    return {
      props: { env, redirect, post: null },
    };
  }

  if (redirect) {
    const redirectUrl = `${NEXT_PUBLIC_WP_BASE_URL}/?p=${id}`;

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const res = await fetch(
    `${NEXT_PUBLIC_WP_BASE_URL}/wp-json/wp/v2/posts?include[]=${id}`
  );
  const posts: Post[] = await res?.json();
  const post = posts?.[0] ?? null;

  return {
    props: {
      env,
      redirect,
      post,
    },
  };
};

export default function Home({
  env,
  redirect,
  post,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  useEffect(() => {
    if (redirect && !!post) {
      router.push(post.guid.rendered);
    }
  }, [post, redirect]);

  const getOGimageUrl = (url: string): string => {
    if (!url) return url;
    const jpgExtension = ".jpg";
    const jpegExtension = ".jpeg";
    const pngExtension = ".png";

    let extension = "";

    if (url.toLowerCase().includes(jpgExtension)) {
      extension = jpgExtension;
    } else if (url.toLowerCase().includes(jpegExtension)) {
      extension = jpegExtension;
    } else if (url.toLowerCase().includes(pngExtension)) {
      extension = pngExtension;
    }

    const trimedUrl = url
      .toLowerCase()
      .substring(0, url.toLowerCase().indexOf(extension));
    return trimedUrl + extension;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{!!post ? post.title.rendered : env.NEXT_PUBLIC_WP_TITLE}</title>
        <link rel="icon" href="/wordpress-circular-logo.png" />
        <meta property="og:url" content={env.NEXT_PUBLIC_WP_BASE_URL} />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={
            post ? post?.yoast_head_json.og_title : env.NEXT_PUBLIC_WP_TITLE
          }
        />
        <meta
          name="description"
          content={post?.yoast_head_json.og_description}
        />
        <meta
          property="og:description"
          content={post?.yoast_head_json.og_description}
        />
        <meta
          property="og:image"
          content={getOGimageUrl(post?.yoast_head_json.og_image[0].url || "")}
        />
      </Head>

      {redirect ?? (
        <main className={styles.main}>
          {!!post ? (
            <div key={post.id}>
              <h1 className={styles.title}>{post.title.rendered}</h1>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              ></div>
            </div>
          ) : (
            <div>
              <h1 className={styles.title}>{env.NEXT_PUBLIC_WP_TITLE}</h1>
            </div>
          )}
        </main>
      )}
      <footer className={styles.footer}></footer>
    </div>
  );
}
