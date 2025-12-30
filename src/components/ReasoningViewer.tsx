import ReactMarkdown from "react-markdown";

const ReasoningViewer: React.FC<{ reasoningSummary: string }> = ({ reasoningSummary }) => {
  return (
    <div>
        <ReactMarkdown>{reasoningSummary}</ReactMarkdown>
    </div>
  );
}

export default ReasoningViewer;