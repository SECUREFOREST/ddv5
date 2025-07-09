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
    <div className="max-w-3xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold text-center mb-8">UI Primitives Demo</h1>
      {/* Button */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Button</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
      </section>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">Modal Title</h3>
          <p>This is a modal dialog. Click outside or press Escape to close.</p>
          <div className="mt-4 text-right">
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Card */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Card</h2>
        <Card
          header="Card Header"
          image="https://placekitten.com/400/200"
          footer={<span>Card Footer</span>}
        >
          <p>This is the card body. You can put any content here.</p>
        </Card>
      </section>

      {/* Tabs */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Tabs</h2>
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
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Dropdown</h2>
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
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Tooltip</h2>
        <Tooltip content="This is a tooltip!">
          <Button>Hover or focus me</Button>
        </Tooltip>
      </section>

      {/* ActCard */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">ActCard</h2>
        <ActCard
          title="Complete the React migration"
          description="Migrate the legacy jQuery/Bootstrap app to a modern React/Node.js stack, preserving all features and improving maintainability."
          difficulty="hard"
          tags={["migration", "react", "legacy"]}
          user={{ username: "alice", avatar: "https://i.pravatar.cc/40?img=1" }}
          actions={[
            <button key="view" className="bg-primary text-white rounded px-2 py-1 text-xs font-semibold mr-2">View</button>,
            <button key="complete" className="bg-green-500 text-white rounded px-2 py-1 text-xs font-semibold">Complete</button>
          ]}
        />
      </section>

      {/* TagsInput */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">TagsInput</h2>
        <label className="block mb-1 font-medium">Tags</label>
        <TagsInput value={tags} onChange={setTags} placeholder="Add a tag..." />
        <div className="mt-2 text-xs text-gray-500">Current tags: {tags.join(', ') || 'None'}</div>
      </section>

      {/* ProgressBar */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">ProgressBar</h2>
        <ProgressBar value={progress} label={`Progress: ${progress}%`} />
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          className="w-full mt-2 accent-primary"
        />
      </section>

      {/* Markdown */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Markdown</h2>
        <textarea
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring focus:border-primary mb-2"
          rows={6}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder="Enter markdown..."
        />
        <div className="bg-gray-50 rounded p-4 border border-gray-200">
          <Markdown>{markdown}</Markdown>
        </div>
      </section>

      {/* Countdown */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Countdown</h2>
        <button
          className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark mb-2"
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
            className="text-blue-500"
          />
        )}
        {countdownDone && <div className="text-green-600 font-semibold mt-2">Countdown complete!</div>}
      </section>

      {/* Accordion */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Accordion</h2>
        <Accordion title="What is this app?" defaultOpen>
          <p>This is a modern React app with a custom UI component library, admin panel, and full-featured backend.</p>
        </Accordion>
        <Accordion title="How does the countdown work?">
          <p>The countdown component uses setInterval to update the time remaining every second, and calls an onComplete callback when finished.</p>
        </Accordion>
      </section>
    </div>
  );
} 