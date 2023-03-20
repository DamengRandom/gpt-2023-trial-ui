import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import Typewriter from "typewriter-effect";
import gptStore from "../zustand/gptStore";
const queryClient = new QueryClient();

function RQDComponent() {
  const currentQuery = gptStore((state) => state?.currentQuery);
  const setCurrentQuery = gptStore((state) => state?.setCurrentQuery);
  const showOrHide = gptStore((state) => state?.showOrHide);
  const toggleShowHide = gptStore((state) => state?.toggleShowHide);
  const answers = gptStore((state) => state?.answers);
  const addAnswers = gptStore((state) => state?.addAnswers);

  const queryMutation = useMutation({
    mutationFn: async (text) => {
      if (text) {
        const response = await fetch(`/api/gpt?words=${text}`); // query eg: "generate a javascript closure code example"

        if (!response.ok) throw new Error("not ok ..");

        const json = await response.json();

        return json?.data?.choices[0]?.text;
      } else {
        return "No request detected yet ..";
      }
    },
    onSuccess: () => {
      // refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["answer"] });
    },
  });

  const getAnswer = (value) => {
    queryMutation.mutate(value, {
      onSuccess: (data) => {
        // save into client state store
        addAnswers({ query: currentQuery, answer: data });
        // reset current query input value
        setCurrentQuery("");
      },
    });
  };

  return (
    <>
      <form>
        <label>Search query: </label>
        <input
          name="query"
          onBlur={(event) => {
            event.preventDefault();
            setCurrentQuery(event.target.value);
            getAnswer(event.target.value);
          }}
        />
      </form>
      {queryMutation?.isLoading && <p>Content generating ..</p>}
      {queryMutation?.isError && (
        <p>Error occurred during generating new content ..</p>
      )}
      {!!queryMutation?.data && (
        <>
          <p>Query: {currentQuery}</p>
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString(queryMutation.data)
                .callFunction(() => {
                  console.log("String typed out!");
                })
                .changeDelay(15)
                .pauseFor(0)
                .start();
            }}
          />
          <button
            onClick={() => {
              toggleShowHide(!showOrHide);
            }}
          >
            {showOrHide ? "show" : "hide"} current records
          </button>
        </>
      )}
      {!!answers?.length &&
        showOrHide &&
        answers.map((a, i) => (
          <div key={`${a.query}-${i}`}>
            <p>{a.query}</p>
            <p>{a.answer}</p>
          </div>
        ))}
    </>
  );
}

export default function RQD() {
  return (
    <QueryClientProvider client={queryClient}>
      <RQDComponent />
    </QueryClientProvider>
  );
}
