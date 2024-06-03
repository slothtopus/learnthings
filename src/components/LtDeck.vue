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
    <CardFooter class="gap-3">
      <Button variant="outline" @click="$emit('edit')">Edit</Button>
      <Button variant="outline" @click="$emit('add')">Add</Button>
      <Button variant="outline" @click="$emit('delete')">Delete</Button>
    </CardFooter>
  </Card>
</template>

<style scoped></style>
@/components/shadcn-ui/card@/components/shadcn-ui/button
