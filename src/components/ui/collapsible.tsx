
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapseProps extends React.ComponentProps<typeof CollapsiblePrimitive.Root> {
  title: string;
  children: React.ReactNode;
}

const Collapse: React.FC<CollapseProps> = ({ 
  title, 
  children, 
  ...props 
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <CollapsiblePrimitive.Root 
      open={isOpen} 
      onOpenChange={setIsOpen}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{title}</div>
        <CollapsiblePrimitive.Trigger asChild>
          <button className="p-2">
            <ChevronDown 
              className={cn(
                "h-5 w-5 transform transition-transform duration-200", 
                isOpen ? "rotate-180" : ""
              )} 
            />
          </button>
        </CollapsiblePrimitive.Trigger>
      </div>
      <CollapsiblePrimitive.Content className="CollapsibleContent space-y-2">
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { Collapse }
