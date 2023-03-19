import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import Typewriter from "typewriter-effect";

const queryClient = new QueryClient();

function RQDComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["answer"],
    queryFn: async () => {
      const response = await fetch(
        `/api/gpt?words=${"generate a javascript closure code example"}`
      );

      if (!response.ok) throw new Error("not ok ..");

      const json = await response.json();

      return json?.data?.choices[0]?.text;
    },
  });

  if (isLoading) return <div>Content generating ..</div>;

  if (isError) return <div>Error fetching data ..</div>;

  return (
    <Typewriter
      onInit={(typewriter) => {
        typewriter
          .typeString(data)
          .callFunction(() => {
            console.log("String typed out!");
          })
          .changeDelay(15)
          .pauseFor(0)
          .start();
      }}
    />
  );
}

export default function RQD() {
  return (
    <QueryClientProvider client={queryClient}>
      <RQDComponent />
    </QueryClientProvider>
  );
}
