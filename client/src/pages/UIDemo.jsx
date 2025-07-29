import React, { useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Dropdown from '../components/Dropdown';
import Tooltip from '../components/Tooltip';
import DareCard from '../components/DareCard';
import TagsInput from '../components/TagsInput';
import ProgressBar from '../components/ProgressBar';
import Markdown from '../components/Markdown';
import Countdown from '../components/Countdown';
import Accordion from '../components/Accordion';
import { Banner } from '../components/Modal';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';

export default function UIDemo() {
  const { showNotification } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [tags, setTags] = useState(["react", "migration"]);
  const [progress, setProgress] = useState(42);
  const [markdown, setMarkdown] = useState(`# Markdown Example\n\n- **Bold** and _italic_\n- [Link](https://example.com)\n- \`inline code\`\n\n1. List item\n2. List item\n\n> Blockquote\n\n\n\n`);
  const [countdownTarget, setCountdownTarget] = useState(null);
  const [countdownDone, setCountdownDone] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-primary" aria-hidden="true" /> UI Demo
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold text-lg animate-fade-in">
          <SparklesIcon className="w-6 h-6" /> UI Demo
        </span>
      </div>

      {/* Button */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Button</h2>
        <Button className="bg-primary text-primary-contrast hover:bg-primary-dark">Open Modal</Button>
      </section>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-4 bg-neutral-900 rounded">
          <h3 className="font-bold text-lg mb-2 text-primary">Modal Title</h3>
          <p className="text-neutral-100">This is a modal dialog. Click outside or press Escape to close.</p>
          <div className="mt-4 text-right">
            <Button className="bg-danger text-danger-contrast hover:bg-danger-dark" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Alert */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Alert</h2>
        <div className="bg-warning text-warning-contrast rounded px-4 py-3 mb-2">This is a warning alert.</div>
        <div className="bg-success text-success-contrast rounded px-4 py-3 mb-2">This is a success alert.</div>
        <div className="bg-danger text-danger-contrast rounded px-4 py-3">This is a danger alert.</div>
      </section>

      {/* Table */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Table</h2>
        <div className="overflow-x-auto rounded ">
          <table className="min-w-full bg-neutral-800 text-sm text-[#fff] border border-neutral-900" role="table">
            <caption className="sr-only">Demo Table</caption>
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th scope="col" className="p-2 text-left font-semibold">Name</th>
                <th scope="col" className="p-2 text-left font-semibold">Role</th>
                <th scope="col" className="p-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                <td className="p-2 font-medium text-primary">Alice</td>
                <td className="p-2 text-info font-bold">Admin</td>
                <td className="p-2 text-success font-bold">Active</td>
              </tr>
              <tr className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                <td className="p-2 font-medium text-primary">Bob</td>
                <td className="p-2 text-info font-bold">User</td>
                <td className="p-2 text-danger font-bold">Banned</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Badge */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Badges</h2>
        <span className="inline-block bg-primary text-primary-contrast rounded-none px-4 py-2 text-sm font-semibold mr-2">Primary</span>
<span className="inline-block bg-success text-success-contrast rounded-none px-4 py-2 text-sm font-semibold mr-2">Success</span>
<span className="inline-block bg-info text-info-contrast rounded-none px-4 py-2 text-sm font-semibold mr-2">Info</span>
<span className="inline-block bg-warning text-warning-contrast rounded-none px-4 py-2 text-sm font-semibold mr-2">Warning</span>
<span className="inline-block bg-danger text-danger-contrast rounded-none px-4 py-2 text-sm font-semibold">Danger</span>
      </section>

      {/* Inputs */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Inputs</h2>
        <input
          className="w-full rounded border border-neutral-900 px-3 py-2 mb-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
          placeholder="Type here..."
        />
        <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark shadow-lg">Submit</button>
      </section>

      {/* Card */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Card</h2>
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
        <h2 className="font-semibold text-lg mb-2 text-primary">Tabs</h2>
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
        <h2 className="font-semibold text-lg mb-2 text-primary">Dropdown</h2>
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
        <h2 className="font-semibold text-lg mb-2 text-primary">Tooltip</h2>
        <Tooltip content="This is a tooltip!">
          <Button>Hover or focus me</Button>
        </Tooltip>
      </section>

      {/* DareCard */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">DareCard</h2>
        <DareCard
          title="Complete the React migration"
          description="Migrate the legacy jQuery/Bootstrap app to a modern React/Node.js stack, preserving all features and improving maintainability."
          difficulty="hard"
          tags={["migration", "react", "legacy"]}
          user={{ username: "alice", avatar: "https://i.pravatar.cc/40?img=1" }}
          actions={[
            <button key="view" className="bg-primary text-primary-contrast rounded px-4 py-2 text-sm font-semibold mr-2 shadow-lg">View</button>,
            <button key="complete" className="bg-success text-success-contrast rounded px-4 py-2 text-sm font-semibold shadow-lg">Complete</button>
          ]}
        />
      </section>

      {/* TagsInput */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">TagsInput</h2>
        <label className="block mb-1 font-medium text-primary">Tags</label>
        <TagsInput value={tags} onChange={setTags} placeholder="Add a tag..." />
        <div className="mt-2 text-xs text-neutral-400">Current tags: {tags.join(', ') || 'None'}</div>
      </section>

      {/* ProgressBar */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">ProgressBar</h2>
        <ProgressBar value={progress} label={`Progress: ${progress}%`} />
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          className="w-full mt-2 accent-primary bg-[#1a1a1a]"
        />
      </section>

      {/* Markdown */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Markdown</h2>
        <textarea
          className="w-full rounded border border-neutral-900 px-3 py-2 font-mono text-sm focus:outline-none focus:ring focus:border-primary mb-2 text-neutral-100 bg-[#1a1a1a]"
          rows={6}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder="Enter markdown..."
        />
        <div className="bg-neutral-900 rounded p-4 border border-neutral-800">
          <Markdown>{markdown}</Markdown>
        </div>
      </section>

      {/* Countdown */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Countdown</h2>
        <button
          className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark mb-2"
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
        {countdownDone && <div className="text-success font-semibold mt-2">Countdown complete!</div>}
      </section>

      {/* Accordion */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-2 text-primary">Accordion</h2>
        <Accordion title="What is this app?" defaultOpen>
          <p>This is a modern React app with a custom UI component library, admin panel, and full-featured backend for dares.</p>
        </Accordion>
        <Accordion title="How does the countdown work?">
          <p>The countdown component uses setInterval to update the time remaining every second, and calls an onComplete callback when finished.</p>
        </Accordion>
      </section>
    </div>
  );
} 