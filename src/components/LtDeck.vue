<script setup lang="ts">
import {
  Card,
  CardContent,
  //CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/shadcn-ui/card'
import { Button } from '@/components/shadcn-ui/button'

import type { Deck } from '@/lib/Deck'

interface Props {
  deck: Deck
}
defineProps<Props>()

defineEmits<{
  edit: [value: void]
  delete: [value: void]
  add: [value: void]
  view: [value: void]
  study: [value: void]
}>()
</script>

<template>
  <Card class="flex flex-col">
    <CardHeader class="flex-grow">
      <CardTitle>{{ deck.name }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Lorem ipsum dipsum shipsum</p>
    </CardContent>
    <CardFooter class="gap-3 flex-wrap">
      <Button variant="outline" @click="$emit('study')">Study</Button>
      <Button variant="outline" @click="$emit('edit')">Edit</Button>
      <Button variant="outline" @click="$emit('view')">View</Button>
      <Button variant="outline" @click="$emit('add')">Add</Button>
      <Button variant="outline" @click="$emit('delete')">Delete</Button>
    </CardFooter>
  </Card>
</template>

<style scoped></style>
