<svg class="sf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    @switch($icon)
        @case('previous')<path d="m14 6-6 6 6 6" />@break
        @case('next')<path d="m10 6 6 6-6 6" />@break
        @case('plus')<path d="M12 5v14M5 12h14" />@break
        @case('minus')<path d="M5 12h14" />@break
        @case('close')<path d="m6 6 12 12M6 18 18 6" />@break
        @case('expand')<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />@break
        @case('search')<circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />@break
        @case('menu')<path d="M4 7h16M4 12h16M4 17h16" />@break
        @case('chat')<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.5-4.6A9 9 0 1 1 21 11.5Z" /><path d="M8 10h8M8 14h5" />@break
        @case('filters')<path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />@break
        @case('sparkles')<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />@break
        @case('photo')<rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />@break
        @case('check')<path d="m5 12 4 4L19 6" />@break
    @endswitch
</svg>
