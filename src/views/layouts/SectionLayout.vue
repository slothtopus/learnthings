<template>
  <section class="rounded-lg bg-white shadow-md flex flex-col">
    <aside class="w-full flex justify-end p-6 pb-2 items-end gap-3">
      <h2
        class="text-2xl font-bold tracking-tight mr-auto whitespace-nowrap text-ellipsis overflow-hidden"
      >
        <slot name="title"></slot>
      </h2>
      <slot name="controls"></slot>
    </aside>
    <main class="grow overflow-auto p-6 flex flex-col">
      <slot name="content"></slot>
    </main>
  </section>
</template>
