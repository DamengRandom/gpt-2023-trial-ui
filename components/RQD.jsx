import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import styled, { css, keyframes } from "styled-components";
import gptStore from "../zustand/gptStore";
const queryClient = new QueryClient();

const cursor = keyframes`
  50% {
    border-color: transparent;
  }
`;

const typing = keyframes`
  from {
    width: 0;
  }
`;

const typeWriterAnimation = (props) =>
  css`
    ${typing} 4s steps(${props.steps}), ${cursor} 4s step-end infinite alternate;
  `;

const QueryForm = styled.div`
  margin-bottom: 2rem;
`;

const AnswerBox = styled.div`
  width: 960px;
  margin: 0;

  pre {
    margin: 0;
  }

  .records-button {
    margin-top: 4rem;
  }
`;

const TypeWriterWrapper = styled.div`
  font-size: 1rem;
  letter-spacing: 0.05rem;
  font-family: monospace;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  animation: ${typeWriterAnimation};
`;

const AnswerRecordsBox = styled.div`
  width: 960px;
`;

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
        addAnswers({ query: value, answer: data });
        // reset current query input value
        // setCurrentQuery("");
      },
    });
  };

  return (
    <>
      <QueryForm>
        <label>Search query: </label>
        <input
          name="query"
          onBlur={(event) => {
            event.preventDefault();
            setCurrentQuery(event.target.value);
            getAnswer(event.target.value);
          }}
        />
      </QueryForm>
      {queryMutation?.isLoading && <p>Content generating ..</p>}
      {queryMutation?.isError && (
        <p>Error occurred during generating new content ..</p>
      )}
      {!!queryMutation?.data && (
        <AnswerBox>
          <p>Query: {currentQuery}</p>

          <TypeWriterWrapper steps={queryMutation.data.length}>
            <pre>{queryMutation.data}</pre>
          </TypeWriterWrapper>

          <button
            className="records-button"
            onClick={() => {
              toggleShowHide(!showOrHide);
            }}
          >
            {showOrHide ? "show" : "hide"} current records
          </button>
        </AnswerBox>
      )}
      {!!answers?.length &&
        showOrHide &&
        answers.map((a, i) => (
          <AnswerRecordsBox key={`${a.query}-${i}`}>
            <p>{a.query}</p>
            <pre>{a.answer}</pre>
            <hr />
          </AnswerRecordsBox>
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
