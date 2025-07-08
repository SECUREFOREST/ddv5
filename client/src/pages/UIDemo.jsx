import React, { useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Dropdown from '../components/Dropdown';
import Tooltip from '../components/Tooltip';
import ActCard from '../components/ActCard';
import TagsInput from '../components/TagsInput';
import ProgressBar from '../components/ProgressBar';
import Markdown from '../components/Markdown';
import Countdown from '../components/Countdown';
import Accordion from '../components/Accordion';

export default function UIDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [tags, setTags] = useState(["react", "migration"]);
  const [progress, setProgress] = useState(42);
  const [markdown, setMarkdown] = useState(`# Markdown Example\n\n- **Bold** and _italic_\n- [Link](https://example.com)\n- \`inline code\`\n\n1. List item\n2. List item\n\n> Blockquote\n\n\n\n`);
  const [countdownTarget, setCountdownTarget] = useState(null);
  const [countdownDone, setCountdownDone] = useState(false);

  return (
    <div className="panel panel-default" style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <div className="panel-heading">
        <h1 className="panel-title">UI Primitives Demo</h1>
      </div>
      <div className="panel-body">
      {/* Button */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Button</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
      </section>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Modal Title</h3>
          <p>This is a modal dialog. Click outside or press Escape to close.</p>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Card */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Card</h2>
        <Card
          header="Card Header"
          image="https://placekitten.com/400/200"
          footer={<span>Card Footer</span>}
        >
          <p>This is the card body. You can put any content here.</p>
        </Card>
      </section>

      {/* Tabs */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Tabs</h2>
        <Tabs
          tabs={[
            { label: 'Tab 1', content: <div>Content for Tab 1</div> },
            { label: 'Tab 2', content: <div>Content for Tab 2</div> },
            { label: 'Tab 3', content: <div>Content for Tab 3</div>, disabled: true },
          ]}
          value={tabIdx}
          onChange={setTabIdx}
        />
      </section>

      {/* Dropdown */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Dropdown</h2>
        <Dropdown
          trigger={<Button>Open Dropdown</Button>}
          items={[
            { label: 'Action 1', onClick: () => alert('Action 1') },
            { label: 'Action 2', onClick: () => alert('Action 2') },
            { label: 'Disabled', disabled: true },
          ]}
        />
      </section>

      {/* Tooltip */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Tooltip</h2>
        <Tooltip content="This is a tooltip!">
          <Button>Hover or focus me</Button>
        </Tooltip>
      </section>

      {/* ActCard */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>ActCard</h2>
        <ActCard
          title="Complete the React migration"
          description="Migrate the legacy jQuery/Bootstrap app to a modern React/Node.js stack, preserving all features and improving maintainability."
          difficulty="hard"
          tags={["migration", "react", "legacy"]}
          user={{ username: "alice", avatar: "https://i.pravatar.cc/40?img=1" }}
          actions={[
              <button key="view" className="btn btn-primary btn-xs">View</button>,
              <button key="complete" className="btn btn-success btn-xs">Complete</button>
          ]}
        />
      </section>

      {/* TagsInput */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>TagsInput</h2>
          <label style={{ display: 'block', marginBottom: 4 }}>Tags</label>
        <TagsInput value={tags} onChange={setTags} placeholder="Add a tag..." />
          <div style={{ marginTop: 8, fontSize: 13, color: '#888' }}>Current tags: {tags.join(', ') || 'None'}</div>
      </section>

      {/* ProgressBar */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>ProgressBar</h2>
        <ProgressBar value={progress} label={`Progress: ${progress}%`} />
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
            className="form-control"
            style={{ marginTop: 8 }}
        />
      </section>

      {/* Markdown */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Markdown</h2>
        <textarea
            className="form-control"
          rows={6}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder="Enter markdown..."
            style={{ marginBottom: 8, fontFamily: 'monospace', fontSize: 14 }}
        />
          <div className="well">
          <Markdown>{markdown}</Markdown>
        </div>
      </section>

      {/* Countdown */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Countdown</h2>
        <button
            className="btn btn-primary"
            style={{ marginBottom: 8 }}
          onClick={() => {
            setCountdownTarget(Date.now() + 2 * 60 * 1000);
            setCountdownDone(false);
          }}
        >
          Start 2-Minute Countdown
        </button>
        {countdownTarget && !countdownDone && (
          <Countdown
            target={countdownTarget}
            onComplete={() => setCountdownDone(true)}
              className="text-info"
          />
        )}
          {countdownDone && <div className="text-success" style={{ fontWeight: 600, marginTop: 8 }}>Countdown complete!</div>}
      </section>

      {/* Accordion */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Accordion</h2>
        <Accordion title="What is this app?" defaultOpen>
          <p>This is a modern React app with a custom UI component library, admin panel, and full-featured backend.</p>
        </Accordion>
        <Accordion title="How does the countdown work?">
          <p>The countdown component uses setInterval to update the time remaining every second, and calls an onComplete callback when finished.</p>
        </Accordion>
      </section>
      </div>
    </div>
  );
} 