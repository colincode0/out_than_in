"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    setIsLoading(false);
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Updates</h1>

        <div className="space-y-6">
          {/* Pinned message from @v */}
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Hello</h2>

            <div className="text-gray-300 mb-4">
              Made by{" "}
              <Link
                href="/v"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @v
              </Link>{" "}
            </div>
            {/* 

            <div className="text-gray-300 mb-4">
              I am{" "}
              <Link
                href="/v"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @v
              </Link>{" "}
              and I am tired of how much the internet has deteriorated since I
              was a kid. When I was young the internet was this wild west
              landscape of self expression. A place where people could be
              themselves more than ever before, in an ironically anonymous way.
              I think it was a transformative turning point in contemporary
              history where children grew up more aware of the complexity,
              atrocity, and beauty in the world than their parents. This is no
              fault of the parents, but for some reason adults seem to let
              curiosity slip away from them when it&apos;s likely the strongest
              tool to bring youthfulness to the mind. The internet is the
              infinite slip n slide for curiosity.
            </div>
            <div className="text-gray-300 mb-4">
              I&apos;m sick of ads and curated feeds. We pay for things we use
              on the internet now, and I would be hard pressed to find someone
              who doesn&apos;t feel like creative content in this world is
              merging more and more with advertising. The goal of this site is
              simple. A chronological social media with no ads or recommended
              posts. Join with a group of friends and see what they post. When
              you scroll down to the post you last saw, you&apos;ve seen
              everything your friends have posted since you last checked.
              That&apos;s it.
            </div>
            <div className="text-gray-100 mb-4">
              This site is designed to cost $1 per month per user, but right now
              it&apos;s free because I need to see if people want the same
              structure of social media as I do. I&apos;m footing the bill until
              it becomes unsustainable or flops.
            </div>
            <div className="text-gray-300 mb-4">
              Some ideas aren&apos;t simple, and neither will be moderating this
              site if people actually use it. This is my website and I will do
              with it what I want, but I will try to make guidelines clear so
              that no one gets thrashed doing something they assumed was ok.
            </div>
            <div className="text-gray-300">
              Go watch Exit Through The Gift Shop or Pirate Radio.
            </div> */}
          </div>

          {/* Software updates will go here in chronological order */}
          {/* <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Latest Updates</h2>
            <p className="text-gray-300 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-gray-300 mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <p className="text-gray-300">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
          </div>

          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-300 mb-4">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut fugit, sed quia consequuntur magni dolores eos qui ratione
              voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
              ipsum quia dolor sit amet, consectetur, adipisci velit.
            </p>
            <p className="text-gray-300">
              Sed quia non numquam eius modi tempora incidunt ut labore et
              dolore magnam aliquam quaerat voluptatem. Ut enim ad minima
              veniam, quis nostrum exercitationem ullam corporis suscipit
              laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </p>
          </div>

          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Bug Fixes</h2>
            <p className="text-gray-300 mb-4">
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit
              esse quam nihil molestiae consequatur, vel illum qui dolorem eum
              fugiat quo voluptas nulla pariatur? At vero eos et accusamus et
              iusto odio dignissimos ducimus qui blanditiis praesentium
              voluptatum deleniti atque corrupti quos dolores et quas molestias
              excepturi sint occaecati cupiditate non provident.
            </p>
            <p className="text-gray-300">
              Similique sunt in culpa qui officia deserunt mollitia animi, id
              est laborum et dolorum fuga. Et harum quidem rerum facilis est et
              expedita distinctio. Nam libero tempore, cum soluta nobis est
              eligendi optio cumque nihil impedit quo minus id quod maxime
              placeat facere possimus.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
