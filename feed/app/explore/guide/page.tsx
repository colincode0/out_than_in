"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GuidePage() {
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
        <h1 className="text-2xl font-bold mb-8 text-center">Guide</h1>

        <div className="space-y-6">
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-300 mb-4">
              The plus in the top right allows you to create a text post or an
              image post.
            </p>
            <p className="text-gray-300 mb-4">
              The three bars in the top left opens the main menu. Your following
              feed will show posts from you and everyone you follow in
              chronological order.
            </p>
            <p className="text-gray-300">
              To change your profile picture or bio, go to settings from the
              main menu.
            </p>
          </div>

          {/* <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How to Post</h2>
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
            <h2 className="text-xl font-semibold mb-4">Following Users</h2>
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
          </div>

          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy & Safety</h2>
            <p className="text-gray-300 mb-4">
              Temporibus autem quibusdam et aut officiis debitis aut rerum
              necessitatibus saepe eveniet ut et voluptates repudiandae sint et
              molestiae non recusandae. Itaque earum rerum hic tenetur a
              sapiente delectus, ut aut reiciendis voluptatibus maiores alias
              consequatur aut perferendis doloribus asperiores repellat.
            </p>
            <p className="text-gray-300">
              Et harum quidem rerum facilis est et expedita distinctio. Nam
              libero tempore, cum soluta nobis est eligendi optio cumque nihil
              impedit quo minus id quod maxime placeat facere possimus, omnis
              voluptas assumenda est, omnis dolor repellendus.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
