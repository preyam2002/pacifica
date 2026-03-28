"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check, Link2, Code2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const ShareButton = ({
  question,
  marketId,
}: {
  question: string
  marketId: string
}) => {
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const url = `${origin}/markets/${marketId}`
  const embedUrl = `${origin}/embed/${marketId}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${question}\n\nPredict on Pacifica:`)
    const shareUrl = encodeURIComponent(url)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5" />
        }
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Share"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => {
          const embed = `<iframe src="${embedUrl}" width="400" height="260" frameborder="0" style="border-radius:16px;overflow:hidden;"></iframe>`
          await navigator.clipboard.writeText(embed)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}>
          <Code2 className="mr-2 h-4 w-4" />
          Copy embed code
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
