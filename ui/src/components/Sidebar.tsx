import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    LayoutDashboard,
    Briefcase,
    Search,
    PenTool,
    FileText,
    FileSignature,
    Headphones,
    CalendarDays,
    BookOpen,
    PanelLeftClose,
    UserCircle
} from "lucide-react";

const navigation = [
    { name: "Notifications", href: "#", icon: Bell },
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Case Management", href: "/cases", icon: Briefcase },
    { name: "Research", href: "/research", icon: Search },
    { name: "Drafting", href: "#", icon: PenTool },
    { name: "Document Storage", href: "#", icon: FileText },
    { name: "Document Processor", href: "#", icon: FileSignature },
    { name: "Meeting Assistant", href: "#", icon: Headphones },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Legal Library", href: "#", icon: BookOpen },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-[260px] h-screen bg-white border-r border-zinc-100 flex-shrink-0 transition-all duration-300">
            {/* Logo/Brand Area */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-100/50">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex items-center justify-center w-7 h-7 bg-zinc-900 rounded-lg shrink-0 overflow-hidden relative">
                        {/* Custom geometric logo matching image abstract icon */}
                        <div className="absolute top-1 left-1 w-2 h-3 bg-white" />
                        <div className="absolute bottom-1 right-1 w-3 h-2 bg-white" />
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/70" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900 font-serif">
                        nyayassist<span className="text-zinc-400 font-sans font-normal ml-0.5">i</span>
                    </span>
                </Link>
                <button className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-50 ml-2">
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200">
                {/* Notifications (Special Item at the top) */}
                <Link
                    href="#"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors mb-6"
                >
                    <Bell className="w-4 h-4 shrink-0" strokeWidth={2} />
                    Notifications
                </Link>

                {/* Separator */}
                <div className="h-px bg-zinc-100 my-4 -mx-2" />

                {navigation.slice(1).map((item) => {
                    // Temporarily mapping "/" to Dashboard and "/research" to the old chat page (which we will move)
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${isActive
                                    ? "bg-blue-50/80 text-blue-900"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/50"
                                }`}
                        >
                            <item.icon
                                className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-700" : "text-zinc-500"}`}
                                strokeWidth={2}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Footer Profile */}
            <div className="p-4 border-t border-zinc-100/80">
                <button className="flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-zinc-50 transition-colors text-left group">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-zinc-200/50">
                        <UserCircle className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className="text-[13px] font-medium text-zinc-700">chotu</span>
                </button>
            </div>
        </div>
    );
}
