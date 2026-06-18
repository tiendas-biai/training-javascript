import type { DeepDive as DeepDiveData } from '../types';
import { RichText } from './RichText';

// Renders a card's deep-dive write-up: prose explanation, an optional runnable
// code example (the RichText code block carries the existing copy-to-clipboard
// button), and a list of doc links.
export function DeepDive({ data }: { data: DeepDiveData }) {
  return (
    <details className="deep-dive">
      <summary className="deep-dive-summary">📘 Deep Dive</summary>
      <div className="deep-dive-body">
        <div className="deep-dive-explanation"><RichText text={data.explanation} /></div>

        {data.example && (
          <div className="deep-dive-example">
            <p className="answer-label">Example</p>
            <RichText text={data.example} />
          </div>
        )}

        {data.resources && data.resources.length > 0 && (
          <div className="deep-dive-resources">
            <p className="answer-label">Further reading</p>
            <ul>
              {data.resources.map(r => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
