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
import { useToast } from '../context/ToastContext';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function UIDemo() {
  const { showSuccess, showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [tags, setTags] = useState(["react", "migration"]);
  const [progress, setProgress] = useState(42);
  const [markdown, setMarkdown] = useState(`# Markdown Example\n\n- **Bold** and _italic_\n- [Link](https://example.com)\n- \`inline code\`\n\n1. List item\n2. List item\n\n> Blockquote\n\n\n\n`);
  const [countdownTarget, setCountdownTarget] = useState(null);
  const [countdownDone, setCountdownDone] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <MainContent className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">UI Demo</h1>
            </div>
            <p className="text-xl text-white/80">Interactive demonstration of UI components</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-full px-6 py-3 font-semibold text-lg">
              <SparklesIcon className="w-6 h-6" /> UI Demo
            </span>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Button */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Button</h2>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                onClick={() => setModalOpen(true)}
              >
                Open Modal
              </Button>
            </div>

            {/* Alert */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Alerts</h2>
              <div className="space-y-3">
                <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl px-4 py-3">This is a warning alert.</div>
                <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl px-4 py-3">This is a success alert.</div>
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3">This is a danger alert.</div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Table</h2>
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full bg-white/5 text-sm text-white border border-white/10" role="table">
                  <caption className="sr-only">Demo Table</caption>
                  <thead>
                    <tr className="bg-white/10">
                      <th scope="col" className="p-3 text-left font-semibold text-white">Name</th>
                      <th scope="col" className="p-3 text-left font-semibold text-white">Role</th>
                      <th scope="col" className="p-3 text-left font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="p-3 font-medium text-purple-300">Alice</td>
                      <td className="p-3 text-blue-300 font-bold">Admin</td>
                      <td className="p-3 text-green-300 font-bold">Active</td>
                    </tr>
                    <tr className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="p-3 font-medium text-purple-300">Bob</td>
                      <td className="p-3 text-blue-300 font-bold">User</td>
                      <td className="p-3 text-red-300 font-bold">Banned</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Badge */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Badges</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full px-4 py-2 text-sm font-semibold">Primary</span>
                <span className="inline-block bg-green-500/20 border border-green-500/30 text-green-300 rounded-full px-4 py-2 text-sm font-semibold">Success</span>
                <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-4 py-2 text-sm font-semibold">Info</span>
                <span className="inline-block bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-full px-4 py-2 text-sm font-semibold">Warning</span>
                <span className="inline-block bg-red-500/20 border border-red-500/30 text-red-300 rounded-full px-4 py-2 text-sm font-semibold">Danger</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Inputs</h2>
              <div className="space-y-4">
                <input
                  className="w-full rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/10 placeholder-white/50"
                  placeholder="Type here..."
                />
                <button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => showSuccess('Form submitted successfully!')}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Card</h2>
              <Card
                header="Card Header"
                image="https://placekitten.com/400/200"
                footer={<span className="text-white/70">Card Footer</span>}
              >
                <p className="text-white/80">This is the card body. You can put any content here.</p>
              </Card>
            </div>

            {/* Tabs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Tabs</h2>
              <Tabs
                tabs={[
                  { label: 'Tab 1', content: <div className="text-white/80">Content for Tab 1</div> },
                  { label: 'Tab 2', content: <div className="text-white/80">Content for Tab 2</div> },
                  { label: 'Tab 3', content: <div className="text-white/80">Content for Tab 3</div>, disabled: true },
                ]}
                value={tabIdx}
                onChange={setTabIdx}
              />
            </div>

            {/* Dropdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Dropdown</h2>
              <Dropdown
                trigger={<Button>Open Dropdown</Button>}
                items={[
                  { label: 'Action 1', onClick: () => showSuccess('Action 1 executed!') },
                  { label: 'Action 2', onClick: () => showSuccess('Action 2 executed!') },
                  { label: 'Disabled', disabled: true },
                ]}
              />
            </div>

            {/* Tooltip */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Tooltip</h2>
              <Tooltip content="This is a tooltip!">
                <Button>Hover or focus me</Button>
              </Tooltip>
            </div>

            {/* DareCard */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">DareCard</h2>
              <DareCard
                title="Complete the React migration"
                description="Migrate the legacy jQuery/Bootstrap app to a modern React/Node.js stack, preserving all features and improving maintainability."
                difficulty="hard"
                tags={["migration", "react", "legacy"]}
                user={{ username: "alice", avatar: "https://i.pravatar.cc/40?img=1" }}
                actions={[
                  <button key="view" className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl px-4 py-2 text-sm font-semibold mr-2 shadow-lg hover:bg-purple-500/30 transition-all duration-200">View</button>,
                  <button key="complete" className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg hover:bg-green-500/30 transition-all duration-200">Complete</button>
                ]}
              />
            </div>

            {/* TagsInput */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">TagsInput</h2>
              <label className="block mb-3 font-medium text-white">Tags</label>
              <TagsInput value={tags} onChange={setTags} placeholder="Add a tag..." />
              <div className="mt-3 text-sm text-white/60">Current tags: {tags.join(', ') || 'None'}</div>
            </div>

            {/* ProgressBar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">ProgressBar</h2>
              <ProgressBar value={progress} label={`Progress: ${progress}%`} />
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full mt-4 accent-purple-500 bg-white/10"
              />
            </div>

            {/* Markdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Markdown</h2>
              <textarea
                className="w-full rounded-xl border border-white/20 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 mb-4 text-white bg-white/10 placeholder-white/50"
                rows={6}
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Enter markdown..."
              />
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Markdown>{markdown}</Markdown>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Countdown</h2>
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-4 py-2 font-semibold text-sm hover:from-purple-700 hover:to-pink-700 mb-4 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                  onComplete={() => {
                    setCountdownDone(true);
                    showSuccess('Countdown complete!');
                  }}
                  className="text-blue-300"
                />
              )}
              {countdownDone && <div className="text-green-300 font-semibold mt-2">Countdown complete!</div>}
            </div>

            {/* Accordion */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="font-semibold text-xl mb-4 text-white">Accordion</h2>
              <div className="space-y-4">
                <Accordion title="What is this app?" defaultOpen>
                  <p className="text-white/80">This is a modern React app with a custom UI component library, admin panel, and full-featured backend for dares.</p>
                </Accordion>
                <Accordion title="How does the countdown work?">
                  <p className="text-white/80">The countdown component uses setInterval to update the time remaining every second, and calls an onComplete callback when finished.</p>
                </Accordion>
              </div>
            </div>
          </div>

          {/* Modal */}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
              <h3 className="font-bold text-xl mb-4 text-white">Modal Title</h3>
              <p className="text-white/80 mb-6">This is a modal dialog. Click outside or press Escape to close.</p>
              <div className="flex justify-end gap-3">
                <button 
                  className="bg-white/10 text-white rounded-xl px-4 py-2 font-semibold hover:bg-white/20 transition-all duration-200"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-4 py-2 font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 