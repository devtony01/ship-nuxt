<template>
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body>
      <Container>
        <Text>Hello {{ firstName }},</Text>
        <Text>Please click the link below to reset your password:</Text>
        <Button :href="href">Reset Password</Button>
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
  href: 'https://ship-nuxt.paracelsus.com/reset-password'
});
</script>