'use client';

import { Avatar } from '@/components/avatar';
import { Dropdown, DropdownButton } from '@/components/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar';
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { PhoneIcon, UserIcon } from '@heroicons/react/20/solid';
import { usePathname } from 'next/navigation';

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
	let pathname = usePathname();

	return (
		<SidebarLayout
			navbar={
				<Navbar>
					<NavbarSpacer />
					<NavbarSection>
						<Dropdown>
							<DropdownButton as={NavbarItem}>
								<Avatar src="/valeri.jpg" square />
							</DropdownButton>
						</Dropdown>
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<Avatar src="icon_valchy_white.png" />
								<SidebarLabel>Valchy AI</SidebarLabel>
							</DropdownButton>
						</Dropdown>
					</SidebarHeader>

					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/" current={pathname === '/'}>
								<PhoneIcon />
								<SidebarLabel>Caller History</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/clients" current={pathname.startsWith('/clients')}>
								<UserIcon />
								<SidebarLabel>Clients</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					</SidebarBody>

					<SidebarFooter className="max-lg:hidden">
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<span className="flex min-w-0 items-center gap-3">
									<Avatar src="/valeri.jpg" className="size-10" square alt="" />
									<span className="min-w-0">
										<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">Valeri</span>
										<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">contact@valerisabev.com</span>
									</span>
								</span>
							</DropdownButton>
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
		>
			{children}
		</SidebarLayout>
	);
}
