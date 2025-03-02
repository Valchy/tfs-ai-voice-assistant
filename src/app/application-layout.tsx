'use client';

import { Avatar } from '@/components/avatar';
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar';
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { getEvents } from '@/data';
import { ArrowRightStartOnRectangleIcon, LightBulbIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/16/solid';
import { PhoneIcon, UserIcon } from '@heroicons/react/20/solid';
import { usePathname } from 'next/navigation';

export function ApplicationLayout({ events, children }: { events: Awaited<ReturnType<typeof getEvents>>; children: React.ReactNode }) {
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
							{/* <AccountDropdownMenu anchor="bottom end" /> */}
						</Dropdown>
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<Avatar src="/teams/catalyst.svg" />
								<SidebarLabel>Valchy AI</SidebarLabel>
								{/* <ChevronDownIcon /> */}
							</DropdownButton>
							{/* <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
								<DropdownItem href="/settings">
									<Cog8ToothIcon />
									<DropdownLabel>Settings</DropdownLabel>
								</DropdownItem>
								<DropdownDivider />
								<DropdownItem href="#">
									<Avatar slot="icon" src="/teams/catalyst.svg" />
									<DropdownLabel>Catalyst</DropdownLabel>
								</DropdownItem>
								<DropdownItem href="#">
									<Avatar slot="icon" initials="BE" className="bg-purple-500 text-white" />
									<DropdownLabel>Big Events</DropdownLabel>
								</DropdownItem>
								<DropdownDivider />
								<DropdownItem href="#">
									<PlusIcon />
									<DropdownLabel>New team&hellip;</DropdownLabel>
								</DropdownItem>
							</DropdownMenu> */}
						</Dropdown>
					</SidebarHeader>

					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/" current={pathname === '/'}>
								<PhoneIcon />
								<SidebarLabel>Caller History</SidebarLabel>
							</SidebarItem>
							{/* <SidebarItem href="/events" current={pathname.startsWith('/events')}>
								<Square2StackIcon />
								<SidebarLabel>Events</SidebarLabel>
							</SidebarItem> */}
							<SidebarItem href="/clients" current={pathname.startsWith('/clients')}>
								<UserIcon />
								<SidebarLabel>Clients</SidebarLabel>
							</SidebarItem>
							{/* <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
								<Cog6ToothIcon />
								<SidebarLabel>Settings</SidebarLabel>
							</SidebarItem> */}
						</SidebarSection>

						{/* <SidebarSection className="max-lg:hidden">
							<SidebarHeading>Upcoming Events</SidebarHeading>
							{events.map(event => (
								<SidebarItem key={event.id} href={event.url}>
									{event.name}
								</SidebarItem>
							))}
						</SidebarSection> */}

						{/* <SidebarSpacer /> */}

						{/* <SidebarSection>
							<SidebarItem href="#">
								<QuestionMarkCircleIcon />
								<SidebarLabel>Support</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="#">
								<SparklesIcon />
								<SidebarLabel>Changelog</SidebarLabel>
							</SidebarItem>
						</SidebarSection> */}
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
								{/* <ChevronUpIcon /> */}
							</DropdownButton>
							{/* <AccountDropdownMenu anchor="top start" /> */}
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
		>
			{children}
		</SidebarLayout>
	);
}

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem href="#">
				<UserCircleIcon />
				<DropdownLabel>My account</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="#">
				<ShieldCheckIcon />
				<DropdownLabel>Privacy policy</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="#">
				<LightBulbIcon />
				<DropdownLabel>Share feedback</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="#">
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}
