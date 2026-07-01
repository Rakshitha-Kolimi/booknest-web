import {
  type AIChatResponse,
  type BookReference,
  chatWithNesty,
} from '@booknest/services'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: number
  role: 'user' | 'nesty'
  text: string
  references?: BookReference[]
}

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'unordered-list'; items: string[] }

let msgIdCounter = 0

const WELCOME: Message = {
  id: msgIdCounter++,
  role: 'nesty',
  text: "Hi! I'm **Nesty**, your BookNest assistant. Ask me anything about books — recommendations, genres, authors, or what's in our catalog!",
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: MarkdownBlock[] = []
  let paragraphLines: string[] = []
  let currentList: MarkdownBlock | null = null

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') })
    paragraphLines = []
  }

  const flushList = () => {
    if (!currentList) return
    blocks.push(currentList)
    currentList = null
  }

  lines.forEach((line) => {
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/)
    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/)

    if (orderedMatch) {
      flushParagraph()
      if (currentList?.type !== 'ordered-list') {
        flushList()
        currentList = { type: 'ordered-list', items: [] }
      }
      currentList.items.push(orderedMatch[1])
      return
    }

    if (unorderedMatch) {
      flushParagraph()
      if (currentList?.type !== 'unordered-list') {
        flushList()
        currentList = { type: 'unordered-list', items: [] }
      }
      currentList.items.push(unorderedMatch[1])
      return
    }

    if (line.trim() === '') {
      flushParagraph()
      flushList()
      return
    }

    flushList()
    paragraphLines.push(line)
  })

  flushParagraph()
  flushList()

  return blocks
}

function renderInlineMarkdown(
  text: string,
  keyPrefix: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let remaining = text
  let index = 0

  while (remaining.length > 0) {
    const boldIndex = remaining.indexOf('**')
    const italicIndex = remaining.split('').findIndex((char, charIndex) => {
      if (char !== '*') return false
      return (
        remaining[charIndex - 1] !== '*' && remaining[charIndex + 1] !== '*'
      )
    })

    const nextIndex =
      boldIndex === -1
        ? italicIndex
        : italicIndex === -1
          ? boldIndex
          : Math.min(boldIndex, italicIndex)

    if (nextIndex === -1) {
      nodes.push(remaining)
      break
    }

    if (nextIndex > 0) {
      nodes.push(remaining.slice(0, nextIndex))
    }

    if (nextIndex === boldIndex) {
      const endIndex = remaining.indexOf('**', nextIndex + 2)
      if (endIndex === -1) {
        nodes.push(remaining.slice(nextIndex))
        break
      }
      nodes.push(
        <strong key={`${keyPrefix}-strong-${index++}`}>
          {renderInlineMarkdown(
            remaining.slice(nextIndex + 2, endIndex),
            `${keyPrefix}-strong-${index}`
          )}
        </strong>
      )
      remaining = remaining.slice(endIndex + 2)
      continue
    }

    const endIndex = remaining.indexOf('*', nextIndex + 1)
    if (endIndex === -1) {
      nodes.push(remaining.slice(nextIndex))
      break
    }
    nodes.push(
      <em key={`${keyPrefix}-em-${index++}`}>
        {renderInlineMarkdown(
          remaining.slice(nextIndex + 1, endIndex),
          `${keyPrefix}-em-${index}`
        )}
      </em>
    )
    remaining = remaining.slice(endIndex + 1)
  }

  return nodes
}

function renderInlineWithBreaks(
  text: string,
  keyPrefix: string
): React.ReactNode[] {
  return text.split('\n').flatMap((line, index) => {
    const lineNodes = renderInlineMarkdown(line, `${keyPrefix}-line-${index}`)
    if (index === 0) return lineNodes
    return [<br key={`${keyPrefix}-br-${index}`} />, ...lineNodes]
  })
}

function ChatMessageText({ text }: { text: string }): React.ReactElement {
  const blocks = parseMarkdownBlocks(text)

  return (
    <div className="nesty-markdown">
      {blocks.map((block, index) => {
        if (block.type === 'ordered-list') {
          return (
            <ol key={`ol-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ol-${index}-${itemIndex}`}>
                  {renderInlineWithBreaks(item, `ol-${index}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          )
        }

        if (block.type === 'unordered-list') {
          return (
            <ul key={`ul-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>
                  {renderInlineWithBreaks(item, `ul-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`p-${index}`}>
            {renderInlineWithBreaks(block.text, `p-${index}`)}
          </p>
        )
      })}
    </div>
  )
}

export function NestyChat(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { id: msgIdCounter++, role: 'user', text }])
    setLoading(true)

    try {
      const res: AIChatResponse = await chatWithNesty(
        text,
        sessionId ? { session_id: sessionId } : undefined
      )

      setSessionId(res.session_id || sessionId)

      setMessages((prev) => [
        ...prev,
        {
          id: msgIdCounter++,
          role: 'nesty',
          text: res.message,
          references: res.references,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdCounter++,
          role: 'nesty',
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Nesty chat"
        className="nesty-fab"
        title="Chat with Nesty"
      >
        <img src="/nesty.png" alt="Nesty" width={52} height={52} />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="nesty-panel" role="dialog" aria-label="Nesty chatbot">
          {/* Header */}
          <div className="nesty-header">
            <div className="nesty-header-info">
              <img src="/nesty.png" alt="Nesty" width={52} height={52} />
              <div>
                <p className="nesty-name">Nesty</p>
                <p className="nesty-subtitle">BookNest AI assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setMessages([WELCOME])
                setSessionId(undefined)
              }}
              className="nesty-close"
              aria-label="Close chat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="nesty-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`nesty-msg nesty-msg--${msg.role}`}>
                {msg.role === 'nesty' && (
                  <img
                    src="/nesty.png"
                    alt="Nesty"
                    width={48}
                    height={48}
                    className="nesty-avatar"
                  />
                )}
                <div className="nesty-bubble-wrap">
                  <div className={`nesty-bubble nesty-bubble--${msg.role}`}>
                    <ChatMessageText text={msg.text} />
                  </div>
                  {msg.references && msg.references.length > 0 && (
                    <div className="nesty-refs">
                      {msg.references.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          className="nesty-ref-card"
                          onClick={() => {
                            navigate(`/books/${book.id}`)
                            setOpen(false)
                          }}
                        >
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.name}
                              className="nesty-ref-img"
                            />
                          ) : (
                            <div className="nesty-ref-img nesty-ref-img--placeholder" />
                          )}
                          <div className="nesty-ref-info">
                            <p className="nesty-ref-name">{book.name}</p>
                            <p className="nesty-ref-price">
                              ${(book.price / 100).toFixed(2)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="nesty-msg nesty-msg--nesty">
                <img
                  src="/nesty.png"
                  alt="Nesty"
                  width={52}
                  height={52}
                  className="nesty-avatar"
                />
                <div className="nesty-bubble nesty-bubble--nesty nesty-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="nesty-input-row">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about books…"
              disabled={loading}
              className="nesty-input"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="nesty-send"
              aria-label="Send"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
