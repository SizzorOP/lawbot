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
    PanelLeftOpen,
    UserCircle,
    Languages
} from "lucide-react";

const navigation = [
    { name: "Notifications", href: "#", icon: Bell },
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Case Management", href: "/cases", icon: Briefcase },
    { name: "Research", href: "/research", icon: Search },
    { name: "Drafting", href: "/drafting", icon: PenTool },
    { name: "Document Storage", href: "/documents", icon: FileText },
    { name: "Translate", href: "/translation", icon: Languages },
    { name: "Meeting Assistant", href: "/meeting", icon: Headphones },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Legal Library", href: "/library", icon: BookOpen },
];

export interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={`flex flex-col h-screen bg-white border-r border-zinc-100 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
            {/* Logo/Brand Area */}
            <div className={`flex items-center h-16 border-b border-zinc-100/50 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                {!isCollapsed && (
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex items-center justify-center w-7 h-7 bg-zinc-900 rounded-lg shrink-0 overflow-hidden relative">
                            {/* Simple minimal YuktiAI geometric logo */}
                            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-sm" />
                            <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-400 rounded-sm" />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900 font-serif">
                            YuktiAI
                        </span>
                    </Link>
                )}
                {isCollapsed && (
                    <button onClick={toggleSidebar} className="text-zinc-600 hover:text-zinc-900 transition-colors p-2 rounded-md hover:bg-zinc-50" title="Expand Sidebar">
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}
                {!isCollapsed && (
                    <button onClick={toggleSidebar} className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-50 ml-2" title="Collapse Sidebar">
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <div className={`flex-1 overflow-y-auto py-6 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {/* Notifications */}
                <Link
                    href="#"
                    className={`flex items-center rounded-lg text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors mb-6 ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}`}
                    title={isCollapsed ? "Notifications" : undefined}
                >
                    <Bell className={`w-4 h-4 shrink-0`} strokeWidth={2} />
                    {!isCollapsed && "Notifications"}
                </Link>

                {/* Separator */}
                <div className={`h-px bg-zinc-100 my-4 ${isCollapsed ? 'mx-2' : '-mx-2'}`} />

                {navigation.slice(1).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center rounded-lg text-[13px] font-medium transition-colors ${isActive
                                ? "bg-blue-50/80 text-blue-900"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/50"
                                } ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}`}
                        >
                            <item.icon
                                className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-700" : "text-zinc-500"}`}
                                strokeWidth={2}
                            />
                            {!isCollapsed && item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Footer Profile */}
            <div className="p-4 border-t border-zinc-100/80">
                <button className={`flex items-center rounded-lg hover:bg-zinc-50 transition-colors text-left group ${isCollapsed ? 'justify-center p-2 w-full' : 'gap-3 px-3 py-3 w-full'}`} title={isCollapsed ? "chotu" : undefined}>
                    <div className={`flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-zinc-200/50 ${isCollapsed ? 'w-8 h-8 shrink-0' : 'w-8 h-8'}`}>
                        <UserCircle className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    {!isCollapsed && <span className="text-[13px] font-medium text-zinc-700">chotu</span>}
                </button>
            </div>
        </div>
    );
}
