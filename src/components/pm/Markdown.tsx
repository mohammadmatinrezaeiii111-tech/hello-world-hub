import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** رندر متن Markdown با پشتیبانی از تیتر، جدول و لیست */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-8 text-foreground" dir="rtl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h3 className="mt-6 mb-3 text-lg font-bold tracking-tight" {...props} />,
          h2: (props) => <h4 className="mt-6 mb-3 text-base font-bold tracking-tight" {...props} />,
          h3: (props) => <h5 className="mt-5 mb-2 text-sm font-bold tracking-tight" {...props} />,
          p: (props) => <p className="my-3 leading-8" {...props} />,
          ul: (props) => <ul className="my-3 list-disc space-y-1 pr-6" {...props} />,
          ol: (props) => <ol className="my-3 list-decimal space-y-1 pr-6" {...props} />,
          li: (props) => <li className="leading-8" {...props} />,
          strong: (props) => <strong className="font-bold text-foreground" {...props} />,
          a: (props) => <a className="text-primary underline underline-offset-4" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="my-4 border-r-4 border-primary/40 bg-muted/40 px-4 py-2 text-muted-foreground"
              {...props}
            />
          ),
          hr: () => <hr className="my-6 border-border" />,
          code: (props) => (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs" {...props} />
          ),
          pre: (props) => (
            <pre className="my-4 overflow-x-auto rounded-xl bg-muted p-4 text-xs" {...props} />
          ),
          table: (props) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-right text-xs" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-muted/60" {...props} />,
          th: (props) => (
            <th className="border-b border-border px-3 py-2 font-bold whitespace-nowrap" {...props} />
          ),
          td: (props) => <td className="border-b border-border/60 px-3 py-2 align-top" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
