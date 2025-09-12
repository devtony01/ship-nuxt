<template>
  <Html>
    <Head />
    <Preview>Welcome on board the Ship!</Preview>
    <Body>
      <Container>
        <Text>Dear {{ firstName }},</Text>
        <Text>We are excited to have you join our growing Ship community.</Text>
        <Text>
          Your account has been successfully verified, and you are now a part of a vibrant network of people who share your
          interest in our digital services. We are confident that our platform will offer you the tools, resources, and
          connections you need to succeed.
        </Text>
        <Button :href="href">Get Started</Button>
      </Container>
    </Body>
  </Html>
</template>

<script setup lang="ts">
import { Html, Head, Preview, Body, Container, Text, Button } from '@vue-email/components'

export interface SignUpWelcomeProps {
  firstName: string
  href: string
}

withDefaults(defineProps<SignUpWelcomeProps>(), {
  firstName: 'Tony',
  href: 'https://ship-nuxt.paracelsus.com'
})
</script>