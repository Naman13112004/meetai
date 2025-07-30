import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getQueryClient, trpc } from "@/trpc/server";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { 
  MeetingIdView, 
  MeetingsIdViewError, 
  MeetingsIdViewLoading 
} from "@/modules/meetings/ui/views/meeting-id-view";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

const Page = async ({ params }: Props) => {
    const { meetingId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if(!session) {
      redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
      trpc.meetings.getOne.queryOptions({ id: meetingId }),
    );

    // TODO: Prefetch `meetings.getTranscript`

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<MeetingsIdViewLoading />}>
            <ErrorBoundary fallback={<MeetingsIdViewError />}>
              <MeetingIdView meetingId={meetingId} />
            </ErrorBoundary>
          </Suspense>
      </HydrationBoundary>
    );
};

export default Page;