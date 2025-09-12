<template>
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body>
      <Container>
        <Text>Hello {{ firstName }},</Text>
        <Text>Please click the link below to verify your email address:</Text>
        <Button :href="href">Verify Email</Button>
      </Container>
    </Body>
  </Html>
</template>

<script setup lang="ts">
import { Html, Head, Preview, Body, Container, Text, Button } from '@vue-email/components'

interface Props {
  firstName: string;
  href: string;
}

withDefaults(defineProps<Props>(), {
  firstName: 'John',
  href: 'https://ship-nuxt.paracelsus.com/verify'
});
</script>