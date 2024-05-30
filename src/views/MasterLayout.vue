<template>
  <div class="h-full flex flex-col">
    <header class="bg-gray-700 text-white shadow grow-0">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight"><slot name="title"></slot></h1>
      </div>
    </header>
    <main class="grow overflow-auto p-6 flex flex-col gap-4 w-full max-w-screen-lg mx-auto">
      <slot name="content"></slot>
    </main>
  </div>
</template>
