import ReactMarkdown from "react-markdown";

const ReasoningViewer: React.FC<{ reasoningSummary: string }> = ({ reasoningSummary }) => {
  return (
    <div className="text-xs">
        <ReactMarkdown>{reasoningSummary}</ReactMarkdown>
    </div>
  );
}

export default ReasoningViewer;