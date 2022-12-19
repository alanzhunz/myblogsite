import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { getServerSideTranslations } from './utils/get-serverside-translations';

import { ArticleHero, ArticleTileGrid } from '@src/components/features/article';
import { SeoFields } from '@src/components/features/seo';
import { Container } from '@src/components/shared/container';
import { PageBlogPostOrder } from '@src/lib/__generated/sdk';
import { client } from '@src/lib/client';
import { revalidateDuration } from '@src/pages/utils/constants';

const Page = ({ page, posts }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation();

  return (
    <>
      {page.seoFields && <SeoFields {...page.seoFields} />}
      <Link href={`/${page.featuredBlogPost.slug}`}>
        <ArticleHero article={page.featuredBlogPost} />
      </Link>

      <Container className="mt-8 mb-8 md:mb-10 lg:mb-16">
        <h2 className="mb-4 md:mb-6">{t('landingPage.latestArticles')}</h2>
        <ArticleTileGrid className="md:grid-cols-2 lg:grid-cols-3" artclePosts={posts} />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const [landingePageData, blogPostsData] = await Promise.all([
      await client.pageLanding({ locale }),
      await client.pageBlogPostCollection({
        limit: 6,
        locale,
        order: PageBlogPostOrder.SysPublishedAtDesc,
      }),
    ]);

    const page = landingePageData.pageLandingCollection?.items[0];
    const posts = blogPostsData.pageBlogPostCollection?.items;

    if (!page) {
      return {
        revalidate: revalidateDuration,
        notFound: true,
      };
    }

    return {
      props: {
        revalidate: revalidateDuration,
        ...(await getServerSideTranslations(locale)),
        page,
        posts,
      },
    };
  } catch {
    return {
      revalidate: revalidateDuration,
      notFound: true,
    };
  }
};

export default Page;
