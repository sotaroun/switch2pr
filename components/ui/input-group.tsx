import { Box, Input } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface InputGroupProps {
  startElement?: React.ReactElement
  endElement?: React.ReactElement
  children: React.ReactElement
  [key: string]: any
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      endElement,
      children,
      ...rest
    } = props

    return (
      <Box position="relative" ref={ref} {...rest}>
        {startElement && (
          <Box
            position="absolute"
            left="3"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            pointerEvents="none"
            color="gray.400"
          >
            {startElement}
          </Box>
        )}
        <Box
          as={Input}
          pl={startElement ? "10" : undefined}
          pr={endElement ? "10" : undefined}
          {...children.props}
        />
        {endElement && (
          <Box
            position="absolute"
            right="3"
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
          >
            {endElement}
          </Box>
        )}
      </Box>
    )
  },
)


export default InputGroup